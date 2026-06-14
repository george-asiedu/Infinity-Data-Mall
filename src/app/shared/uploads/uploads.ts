import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../ui/button/button';
import { CommonModule } from '@angular/common';
import { Toast } from '../../core/services/toast/toast';
import { forkJoin, Subscription, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { Upload } from './service/upload';
import {
  CompleteUploadModel,
  InitiateUploadModel,
  InitiateUploadResponse,
  UploadPartPart,
} from '../../core/models/upload.model';
import { uploadActions } from './store/uploads.actions';
import {
  selectActiveUpload,
  selectCompletedAsset,
  selectError,
  selectIsLoading,
} from './store/uploads.selectors';

@Component({
  selector: 'app-uploads',
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './uploads.html',
  styleUrl: './uploads.css',
})
export class Uploads implements OnDestroy {
  private readonly store = inject(Store);
  private readonly uploadService = inject(Upload);
  private readonly toast = inject(Toast);

  public visible = model<boolean>(false);
  public category = input.required<'business_logo' | 'user_logo'>();
  public uploadSuccess = output<{ key: string; shortUrl: string; longUrl: string }>();

  protected selectedFile = signal<File | null>(null);
  protected uploadProgress = signal<number>(0);
  protected isUploadingChunks = signal<boolean>(false);

  // User-editable base name (without extension) shown after a file is selected.
  protected editableFileName = signal<string>('');

  /** Original extension of the selected file, kept regardless of renaming. */
  protected readonly fileExtension = computed<string>(() => {
    const name = this.selectedFile()?.name ?? '';
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot) : '';
  });

  protected readonly isNameValid = computed<boolean>(
    () => this.editableFileName().trim().length > 0,
  );

  protected storeLoading = this.store.selectSignal(selectIsLoading);
  protected storeError = this.store.selectSignal(selectError);
  protected activeUpload = this.store.selectSignal(selectActiveUpload);
  protected completedAsset = this.store.selectSignal(selectCompletedAsset);

  private activeUploadSubscription?: Subscription;
  private constantChunkSize = 5 * 1024 * 1024;

  constructor() {
    effect(() => {
      const activeSession = this.activeUpload();
      const file = this.selectedFile();

      if (activeSession && file && !this.isUploadingChunks()) {
        this.processS3ChunkUploads(activeSession, file);
      }
    });

    effect(() => {
      const completedData = this.completedAsset();
      if (completedData) {
        this.uploadSuccess.emit(completedData);
        this.closeModal();
      }
    });
  }

  protected onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.validateAndSetFile(inputElement.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image uploads are permitted for application logos.');
      return;
    }
    this.selectedFile.set(file);
    this.uploadProgress.set(0);

    // Seed the editable name with the file's base name (sans extension).
    const dot = file.name.lastIndexOf('.');
    this.editableFileName.set(dot > 0 ? file.name.slice(0, dot) : file.name);
  }

  protected startUploadProcess(): void {
    const file = this.selectedFile();
    if (!file || !this.isNameValid()) return;

    const partCount = Math.ceil(file.size / this.constantChunkSize) || 1;

    // Use the (possibly renamed) base name, sanitised for a safe object key,
    // and re-attach the original extension.
    const safeBaseName =
      this.editableFileName()
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .trim() || 'logo';
    const finalFileName = `${safeBaseName}${this.fileExtension()}`;

    const payload: InitiateUploadModel = {
      fileName: finalFileName,
      contentType: file.type,
      partCount: partCount,
      category: this.category(),
    };

    this.store.dispatch(uploadActions.initiateUpload({ model: payload }));
  }

  private processS3ChunkUploads(session: InitiateUploadResponse, file: File): void {
    this.isUploadingChunks.set(true);
    this.uploadProgress.set(0);

    const totalParts = session.presignedUrls.length;
    let completedParts = 0;

    const chunkRequests = session.presignedUrls.map((targetUrl, i) => {
      const startByte = i * this.constantChunkSize;
      const endByte = Math.min(file.size, startByte + this.constantChunkSize);
      const fileChunk = file.slice(startByte, endByte, file.type);

      return this.uploadService.uploadPartToS3(targetUrl, fileChunk).pipe(
        tap(() => {
          completedParts += 1;
          this.uploadProgress.set(Math.round((completedParts / totalParts) * 100));
        }),
      );
    });

    // Process chunk sequence
    this.activeUploadSubscription = forkJoin(chunkRequests).subscribe({
      next: (responses) => {
        const partsCollection: UploadPartPart[] = responses.map((res, index) => {
          const rawETag = res.headers.get('ETag') || '';
          const cleanedETag = rawETag.replace(/"/g, '');

          return {
            partNumber: index + 1,
            eTag: cleanedETag,
          };
        });

        const finalizedPayload: CompleteUploadModel = {
          uploadId: session.uploadId,
          key: session.key,
          contentType: file.type,
          parts: partsCollection,
        };

        this.store.dispatch(uploadActions.completeUpload({ model: finalizedPayload }));
      },
      error: () => {
        this.isUploadingChunks.set(false);

        this.store.dispatch(
          uploadActions.uploadError({
            error: 'Direct S3 infrastructure streaming processing failed.',
          }),
        );
        this.toast.error('Failed processing chunks to S3 buckets.');

        this.store.dispatch(
          uploadActions.abortUpload({
            model: { uploadId: session.uploadId, key: session.key },
          }),
        );
      },
    });
  }

  protected removeSelectedFile(): void {
    if (this.isUploadingChunks()) return;
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.editableFileName.set('');
  }

  protected closeModal(): void {
    this.removeSelectedFile();
    this.isUploadingChunks.set(false);
    this.store.dispatch(uploadActions.clearUploadState());
    this.visible.set(false);
  }

  ngOnDestroy(): void {
    if (this.activeUploadSubscription) {
      this.activeUploadSubscription.unsubscribe();
    }
  }
}
