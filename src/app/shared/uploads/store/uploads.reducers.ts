import { createFeature, createReducer, on } from '@ngrx/store';
import { UploadState } from '../../../core/models/upload.model';
import { uploadActions } from './uploads.actions';

export const initialState: UploadState = {
  isLoading: false,
  error: null,
  activeUpload: null,
  completedAsset: null,
  category: null,
};

export const uploadFeature = createFeature({
  name: 'Upload',
  reducer: createReducer(
    initialState,
    on(uploadActions.initiateUpload, (state, { model }) => ({
      ...state,
      isLoading: true,
      category: model.category,
    })),
    on(uploadActions.completeUpload, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(uploadActions.initiateUploadSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      activeUpload: response,
    })),
    on(uploadActions.completeUploadSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      completedAsset: response.data,
    })),
    on(uploadActions.abortUpload, (state) => ({
      ...state,
      isLoading: false,
      activeUpload: null,
    })),
    on(uploadActions.uploadError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(uploadActions.clearUploadState, () => initialState),
  ),
});
