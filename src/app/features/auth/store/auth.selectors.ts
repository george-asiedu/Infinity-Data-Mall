import { authFeature } from './auth.reducers';

export const {
  selectIsLoading,
  selectLoggedIn,
  selectRegistered,
  selectRegistrationEmail,
  selectRefreshToken,
  selectError,
} = authFeature;
