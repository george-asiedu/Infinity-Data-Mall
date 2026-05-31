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
