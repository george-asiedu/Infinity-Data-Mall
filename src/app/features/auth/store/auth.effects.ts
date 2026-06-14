import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Auth } from '../service/auth';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast/toast';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { authActions } from './auth.actions';
import { paymentActions } from '../../payment/store/payment.actions';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const registerEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.register),
      switchMap(({ model }) =>
        authService.register(model).pipe(
          map((registered) => {
            toast.success(registered.message);
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
          map((mfaToken) => {
            toast.success(mfaToken.message);
            router.navigate(['/mfa']);
            return authActions.loginSuccess({ mfaToken });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const loginWithCodeEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.loginWithCode),
      switchMap(({ model }) =>
        authService.loginWithCode(model).pipe(
          map((loggedIn) => {
            toast.success(loggedIn.message);
            return authActions.loginWithCodeSuccess({ loggedIn });
          }),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const onLoadWalletEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    return actions$.pipe(
      ofType(authActions.loginWithCodeSuccess, authActions.verifyMfaSuccess),
      map(({ loggedIn }) => {
        const userId = loggedIn.data.user.id;
        return paymentActions.getWallet({ userId });
      }),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyEmailEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.verifyEmail),
      switchMap(({ model }) =>
        authService.verifyEmail(model, window.location.origin).pipe(
          map((response) => {
            toast.success(response.message);
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

export const resendMfaCodeEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.resendMfaCode),
      switchMap(({ email }) =>
        authService.resendMfaCode(email).pipe(
          map((response) => {
            toast.success(response.message);
            return authActions.resendMfaCodeSuccess({ response });
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
          map((loggedIn) => {
            toast.success(loggedIn.message);

            if (loggedIn.data.user.settlementBankAccount) {
              router.navigate(['/dashboard']);
            } else {
              router.navigate(['/onboarding']);
            }

            return authActions.verifyMfaSuccess({ loggedIn });
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
          map((response) => {
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
  (actions$ = inject(Actions), authService = inject(Auth), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(authActions.resetPassword),
      switchMap(({ model, token }) =>
        authService.resetPassword(model, token).pipe(
          map((response) => {
            toast.success(response.message);
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
          map((response) => authActions.verifyTokenSuccess({ response })),
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
          map((refreshToken) => authActions.refreshTokenSuccess({ refreshToken })),
          handleApiError((errorMsg) => authActions.authError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const logoutRouteEffects = createEffect(
  (actions$ = inject(Actions), route = inject(Router)) => {
    return actions$.pipe(
      ofType(authActions.logout),
      tap(() => route.navigateByUrl('')),
    );
  },
  { functional: true, dispatch: false },
);

export const clearAuthStateEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(authActions.verifyMfaSuccess, authActions.loginWithCodeSuccess),
      map(() => authActions.clearAuthState()),
    );
  },
  { dispatch: true, functional: true },
);

export const logoutServerEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(Auth)) => {
    return actions$.pipe(
      ofType(authActions.logout),
      switchMap(() => authService.logout().pipe(catchError(() => of(null)))),
    );
  },
  { functional: true, dispatch: false },
);
