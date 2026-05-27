/* eslint-disable @typescript-eslint/no-explicit-any */
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Auth } from '../service/auth';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast/toast';
import { map, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { authActions } from './auth.actions';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const registerEffect = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(Auth),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(authActions.register),
      switchMap(({ model }) =>
        authService.register(model).pipe(
          map((registered) => {
            toast.success(registered.message);
            router.navigate(['/verify-email']);
            return authActions.registerSuccess({ registered });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const loginEffect = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(Auth),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(authActions.login),
      switchMap(({ model }) =>
        authService.login(model).pipe(
          map((loggedIn: any) => {
            toast.success(loggedIn.message);
            router.navigate(['/dashboard']);
            return authActions.loginSuccess({ loggedIn });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyEmailEffect = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(Auth),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(authActions.verifyEmail),
      switchMap(({ model }) =>
        authService.verifyEmail(model, window.location.origin).pipe(
          map((response) => {
            toast.success(response.message);
            if (response?.data?.authorizationUrl) {
              window.location.href = response.data.authorizationUrl;
            } else {
              router.navigate(['/login']);
            }
            return authActions.verifyEmailSuccess({ response });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const resendVerificationEmailEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.resendEmailVerification),
      switchMap(({ email }) =>
        authService.resendVerificationEmail(email).pipe(
          map((response) => {
            toast.success(response.message);
            return authActions.resendEmailVerificationSuccess({ response });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyMfaEffect = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(Auth),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(authActions.verifyMfa),
      switchMap(({ model }) =>
        authService.verifyMfa(model).pipe(
          map((response: any) => {
            toast.success(response.message);
            router.navigate(['/dashboard']);
            return authActions.verifyMfaSuccess({ response });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const requestPasswordResetEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.requestPasswordReset),
      switchMap(({ email }) =>
        authService.requestPasswordReset(email, window.location.origin).pipe(
          map((response: any) => {
            toast.success(response.message);
            return authActions.requestPasswordResetSuccess({ response });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const resetPasswordEffect = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(Auth),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(authActions.resetPassword),
      switchMap(({ model, token }) =>
        authService.resetPassword(model, token).pipe(
          map((response: any) => {
            toast.success(response.message);
            router.navigate(['/login']);
            return authActions.resetPasswordSuccess({ response });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyTokenEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.verifyToken),
      switchMap(({ token }) =>
        authService.verifyToken(token).pipe(
          map((response: any) => authActions.verifyTokenSuccess({ response })),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const refreshTokenEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.refreshToken),
      switchMap(() =>
        authService.refreshToken().pipe(
          map((refreshToken: any) => authActions.refreshTokenSuccess({ refreshToken })),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);
