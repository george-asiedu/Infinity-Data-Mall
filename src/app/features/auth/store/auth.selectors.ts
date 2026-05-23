import { authFeature } from './auth.reducers';

export const {
  selectIsLoading,
  selectLoggedIn,
  selectRegistered,
  selectRefreshToken,
  selectError,
} = authFeature;
