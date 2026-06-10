/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, effect, inject, input, model, OnDestroy, output, signal } from '@angular/core';
import { Button } from '../ui/button/button';
import { CommonModule } from '@angular/common';
import { Toast } from '../../core/services/toast/toast';
import { forkJoin, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import {
  CompleteUploadModel,
  InitiateUploadModel,
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
  imports: [CommonModule, Button],
  templateUrl: './uploads.html',
  styleUrl: './uploads.css',
})
export class Uploads implements OnDestroy {
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(Toast);

  // Modern Signal Inputs/Outputs matching project design patterns
  public visible = model<boolean>(false);
  public category = input.required<'business_logo' | 'user_logo'>();
  public uploadSuccess = output<{ key: string; shortUrl: string; longUrl: string }>();

  // Component Local State Indicators
  protected selectedFile = signal<File | null>(null);
  protected uploadProgress = signal<number>(0);
  protected isUploadingChunks = signal<boolean>(false);

  // Expose store selectors to your view layout via Signals
  protected storeLoading = this.store.selectSignal(selectIsLoading);
  protected storeError = this.store.selectSignal(selectError);
  protected activeUpload = this.store.selectSignal(selectActiveUpload);
  protected completedAsset = this.store.selectSignal(selectCompletedAsset);

  private activeUploadSubscription?: Subscription;
  private constantChunkSize = 5 * 1024 * 1024; // Standard AWS S3 Minimum multi-part block size (5MB)

  constructor() {
    // Monitor the NgRx state tree for active upload configurations
    effect(() => {
      const activeSession = this.activeUpload();
      const file = this.selectedFile();

      if (activeSession && file && !this.isUploadingChunks()) {
        this.processS3ChunkUploads(activeSession, file);
      }
    });

    // Monitor for final backend synchronization resolution
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
  }

  protected startUploadProcess(): void {
    const file = this.selectedFile();
    if (!file) return;

    // Calculate part distribution count based on S3 specifications
    const partCount = Math.ceil(file.size / this.constantChunkSize) || 1;

    const payload: InitiateUploadModel = {
      fileName: file.name,
      contentType: file.type,
      partCount: partCount,
      category: this.category(),
    };

    // Stage 1: Call Backend Initiate Endpoint
    this.store.dispatch(uploadActions.initiateUpload({ model: payload }));
  }

  private processS3ChunkUploads(session: any, file: File): void {
    this.isUploadingChunks.set(true);
    const chunkRequests = [];
    const totalParts = session.presignedUrls.length;

    for (let i = 0; i < totalParts; i++) {
      const startByte = i * this.constantChunkSize;
      const endByte = Math.min(file.size, startByte + this.constantChunkSize);
      const fileChunk = file.slice(startByte, endByte, file.type);
      const targetUrl = session.presignedUrls[i];

      // Perform a standard HTTP PUT binary chunk payload upload to S3
      // We explicitly request 'response' tracking to read S3 ETag headers
      const uploadChunk$ = this.http.put(targetUrl, fileChunk, {
        headers: { 'Content-Type': file.type },
        observe: 'response',
        responseType: 'text',
      });

      chunkRequests.push(uploadChunk$);
    }

    // Process chunk sequence
    this.activeUploadSubscription = forkJoin(chunkRequests).subscribe({
      next: (responses) => {
        const partsCollection: UploadPartPart[] = responses.map((res: any, index) => {
          // Extract ETag from response header, removing escaping double quotes from standard S3 syntax
          const rawETag = res.headers.get('ETag') || '';
          const cleanedETag = rawETag.replace(/"/g, '');

          return {
            partNumber: index + 1,
            eTag: cleanedETag,
          };
        });

        // Progress update visualization
        this.uploadProgress.set(100);

        const finalizedPayload: CompleteUploadModel = {
          uploadId: session.uploadId,
          key: session.key,
          contentType: file.type,
          parts: partsCollection,
        };

        // Stage 2: Call Backend Complete Endpoint to finalize merge transformations
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
      },
    });
  }

  protected removeSelectedFile(): void {
    if (this.isUploadingChunks()) return;
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
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
