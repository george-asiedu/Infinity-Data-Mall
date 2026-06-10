import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  AbortUploadModel,
  CompleteUploadModel,
  CompleteUploadResponse,
  InitiateUploadModel,
  InitiateUploadResponse,
  SaveLogoModel,
  SaveLogoResponse,
} from '../../../core/models/upload.model';

@Injectable({
  providedIn: 'root',
})
export class Upload {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  public initiateUpload(model: InitiateUploadModel) {
    return this.http.post<InitiateUploadResponse>(`${this.api}upload/initiate`, model);
  }

  public completeUpload(model: CompleteUploadModel) {
    return this.http.post<CompleteUploadResponse>(`${this.api}upload/complete`, model);
  }

  public abortMultipart(model: AbortUploadModel) {
    return this.http.post<{ message: string }>(`${this.api}upload/abort`, model);
  }

  public saveBusinessLogo(id: string, model: SaveLogoModel) {
    return this.http.post<SaveLogoResponse>(`${this.api}${id}/business-logo`, model);
  }

  public saveProfileLogo(id: string, model: SaveLogoModel) {
    return this.http.post<SaveLogoResponse>(`${this.api}${id}/profile-logo`, model);
  }

  public uploadPartToS3(url: string, filePart: Blob) {
    return this.http.put(url, filePart, { headers: { 'Content-Type': filePart.type } });
  }
}
