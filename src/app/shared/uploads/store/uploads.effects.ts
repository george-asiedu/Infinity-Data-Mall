import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Toast } from '../../../core/services/toast/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { selectUser } from '../../../features/auth/store/auth.selectors';
import { selectCategory } from './uploads.selectors';
import { uploadActions } from './uploads.actions';
import { Upload } from '../service/upload';

export const initiateUploadEffect = createEffect(
  (actions$ = inject(Actions), uploadService = inject(Upload), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(uploadActions.initiateUpload),
      switchMap(({ model }) =>
        uploadService.initiateUpload(model).pipe(
          map((response) => {
            toast.success(response.message);
            return uploadActions.initiateUploadSuccess({ response });
          }),
          handleApiError((errorMsg) => uploadActions.uploadError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const completeUploadEffect = createEffect(
  (actions$ = inject(Actions), uploadService = inject(Upload), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(uploadActions.completeUpload),
      switchMap(({ model }) =>
        uploadService.completeUpload(model).pipe(
          map((response) => {
            return uploadActions.completeUploadSuccess({ response });
          }),
          handleApiError((errorMsg) => uploadActions.uploadError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const handleCompletedLogoMappingEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    uploadService = inject(Upload),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(uploadActions.completeUploadSuccess),
      withLatestFrom(store.select(selectCategory), store.select(selectUser)),
      switchMap(([{ response }, category, user]) => {
        const logoPayload = {
          logoShortUrl: response.data.shortUrl,
          logoLongUrl: response.data.longUrl,
        };

        if (!user?.id) {
          return of(
            uploadActions.uploadError({ error: 'Authenticated user is required to save logo.' }),
          );
        }

        if (category === 'business_logo') {
          return uploadService.saveBusinessLogo(user.id, logoPayload).pipe(
            map((res) => uploadActions.saveLogoSuccess({ response: res })),
            handleApiError((errorMsg) => uploadActions.uploadError({ error: errorMsg }), toast),
          );
        } else if (category === 'user_logo') {
          return uploadService.saveProfileLogo(user.id, logoPayload).pipe(
            map((res) => uploadActions.saveLogoSuccess({ response: res })),
            handleApiError((errorMsg) => uploadActions.uploadError({ error: errorMsg }), toast),
          );
        }

        toast.success(response.message);
        return of(uploadActions.clearUploadState());
      }),
    );
  },
  { dispatch: true, functional: true },
);

export const saveLogoSuccessEffect = createEffect(
  (actions$ = inject(Actions), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(uploadActions.saveLogoSuccess),
      map(({ response }) => {
        toast.success(response.message);
        return uploadActions.clearUploadState();
      }),
    );
  },
  { dispatch: true, functional: true },
);
