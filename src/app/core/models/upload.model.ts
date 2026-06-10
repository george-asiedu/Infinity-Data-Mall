export interface InitiateUploadModel {
  fileName: string;
  contentType: string;
  partCount: number;
  category: 'business_logo' | 'user_logo';
}

export interface InitiateUploadResponse {
  message: string;
  uploadId: string;
  key: string;
  presignedUrls: string[];
}

export interface UploadPartPart {
  partNumber: number;
  eTag: string;
}

export interface CompleteUploadModel {
  uploadId: string;
  key: string;
  contentType: string;
  parts: UploadPartPart[];
}

export interface CompleteUploadResponse {
  message: string;
  data: {
    key: string;
    shortUrl: string;
    longUrl: string;
  };
}

export interface AbortUploadModel {
  uploadId: string;
  key: string;
}

export interface SaveLogoModel {
  logoShortUrl: string;
  logoLongUrl: string;
}

export interface SaveLogoResponse {
  message: string;
  data: {
    key: string;
    shortUrl: string;
    longUrl: string;
  };
}

export interface UploadState {
  isLoading: boolean;
  error: string | null;
  activeUpload: InitiateUploadResponse | null;
  completedAsset: CompleteUploadResponse['data'] | null;
  category: 'business_logo' | 'user_logo' | null;
}
