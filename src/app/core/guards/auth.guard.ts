import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { AuthState, User, VerifyMfaResponse } from '../models/auth.model';
import { Toast } from '../services/toast/toast';
import { authActions } from '../../features/auth/store/auth.actions';
import { selectAccessToken } from '../../features/auth/store/auth.selectors';
import { Auth } from '../../features/auth/service/auth';
import { catchError, map, of, take } from 'rxjs';

const getDependencies = () => {
  return {
    store: inject(Store<AuthState>),
    toast: inject(Toast),
    authService: inject(Auth),
    router: inject(Router),
  };
};

const handleUnauthorizedAccess = (store: Store<AuthState>, toast: Toast) => {
  toast.warn('Authentication session expired. Please log in again.');
  store.dispatch(authActions.logout());
};

const checkAuth = (route: ActivatedRouteSnapshot) => {
  const urlAccessToken = route.queryParamMap.get('access_token');
  const urlRefreshToken = route.queryParamMap.get('refresh_token');

  const { store, toast, authService, router } = getDependencies();
  const accessToken = store.selectSignal(selectAccessToken);

  if (urlAccessToken && urlRefreshToken) {
    return authService.getAuthenticatedUser(urlAccessToken).pipe(
      take(1),
      map((response) => {
        const userProfile: User = response?.data;

        const oauthPayload: VerifyMfaResponse = {
          message: 'Successfully authenticated via Google',
          data: {
            user: userProfile,
            token: {
              accessToken: urlAccessToken,
              refreshToken: urlRefreshToken,
            },
          },
        };

        if (userProfile.settlementBankAccount) {
          router.navigate(['/dashboard']);
        } else {
          router.navigate(['/onboarding']);
        }

        store.dispatch(authActions.verifyMfaSuccess({ loggedIn: oauthPayload }));
        return true;
      }),
      catchError(() => {
        handleUnauthorizedAccess(store, toast);
        return of(false);
      }),
    );
  }

  if (!accessToken()) {
    handleUnauthorizedAccess(store, toast);
    return of(false);
  }

  return of(true);
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  return checkAuth(route);
};
