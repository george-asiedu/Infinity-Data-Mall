import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CompleteUploadModel,
  CompleteUploadResponse,
  InitiateUploadModel,
  InitiateUploadResponse,
  SaveLogoResponse,
} from '../../../core/models/upload.model';

export const uploadActions = createActionGroup({
  source: 'Upload',
  events: {
    InitiateUpload: props<{ model: InitiateUploadModel }>(),
    InitiateUploadSuccess: props<{ response: InitiateUploadResponse }>(),

    CompleteUpload: props<{ model: CompleteUploadModel }>(),
    CompleteUploadSuccess: props<{ response: CompleteUploadResponse }>(),

    SaveLogoSuccess: props<{ response: SaveLogoResponse }>(),

    UploadError: props<{ error: string }>(),
    ClearUploadState: emptyProps(),
  },
});
