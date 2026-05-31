import { createSelector } from '@ngrx/store';
import { authFeature } from './auth.reducers';

export const {
  selectAuthState,
  selectIsLoading,
  selectMfaToken,
  selectLoggedIn,
  selectRegistered,
  selectRegistrationEmail,
  selectRefreshToken,
  selectError,
} = authFeature;

export const selectAccessToken = createSelector(
  selectLoggedIn,
  selectRefreshToken,
  (loggedIn, refreshToken) => refreshToken?.data.token ?? loggedIn?.data.token.accessToken ?? null,
);
