import { authFeature } from './auth.reducers';

export const {
  selectIsLoading,
  selectMfaToken,
  selectLoggedIn,
  selectRegistered,
  selectRegistrationEmail,
  selectRefreshToken,
  selectError,
} = authFeature;
