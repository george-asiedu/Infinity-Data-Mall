import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { AuthState, User, VerifyMfaResponse } from '../models/auth.model';
import { Toast } from '../services/toast/toast';
import { authActions } from '../../features/auth/store/auth.actions';
import { selectAccessToken } from '../../features/auth/store/auth.selectors';

const getDependencies = () => {
  return {
    store: inject(Store<AuthState>),
    toast: inject(Toast),
  };
};

const handleUnauthorizedAccess = (store: Store<AuthState>, toast: Toast) => {
  toast.warn('Authentication session expired. Please log in again.');
  store.dispatch(authActions.logout());
};

const checkAuth = (route: ActivatedRouteSnapshot) => {
  const urlAccessToken = route.queryParamMap.get('access_token');
  const urlRefreshToken = route.queryParamMap.get('refresh_token');

  const { store, toast } = getDependencies();
  const accessToken = store.selectSignal(selectAccessToken);

  if (urlAccessToken && urlRefreshToken) {
    const oauthPayload: VerifyMfaResponse = {
      message: 'Successfully authenticated via Google OAuth',
      data: {
        user: {} as User,
        token: {
          accessToken: urlAccessToken,
          refreshToken: urlRefreshToken,
        },
      },
    };
    store.dispatch(authActions.verifyMfaSuccess({ loggedIn: oauthPayload }));

    return true;
  }

  if (!accessToken()) {
    handleUnauthorizedAccess(store, toast);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  return checkAuth(route);
};
