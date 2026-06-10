import { uploadFeature } from './uploads.reducers';

export const {
  selectUploadState,
  selectIsLoading,
  selectActiveUpload,
  selectCategory,
  selectCompletedAsset,
  selectError,
} = uploadFeature;
