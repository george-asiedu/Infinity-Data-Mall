import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthState } from '../../../core/models/auth.model';
import { authActions } from './auth.actions';

export const initialState: AuthState = {
  isLoading: false,
  loggedIn: null,
  registered: null,
  registrationEmail: null,
  refreshToken: null,
  error: null,
};

export const authFeature = createFeature({
  name: 'Auth',
  reducer: createReducer(
    initialState,
    on(
      authActions.login,
      authActions.verifyEmail,
      authActions.verifyMfa,
      authActions.requestPasswordReset,
      authActions.resetPassword,
      authActions.verifyToken,
      authActions.refreshToken,
      (state) => ({
        ...state,
        isLoading: true,
      }),
    ),
    on(authActions.register, (state, { model }) => ({
      ...state,
      isLoading: true,
      registrationEmail: model.email,
    })),
    on(authActions.registerSuccess, (state, { registered }) => ({
      ...state,
      isLoading: false,
      registered,
    })),
    on(authActions.loginSuccess, (state, { loggedIn }) => ({
      ...state,
      isLoading: false,
      loggedIn,
    })),
    on(authActions.verifyEmailSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
      registrationEmail: null,
    })),
    on(authActions.verifyMfaSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
    })),
    on(authActions.requestPasswordResetSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
    })),
    on(authActions.resetPasswordSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
    })),
    on(authActions.verifyTokenSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
    })),
    on(authActions.refreshTokenSuccess, (state, { refreshToken }) => ({
      ...state,
      isLoading: false,
      refreshToken,
      error: null,
    })),
    on(authActions.authError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(authActions.logout, (state) => ({
      ...state,
      loggedIn: null,
      refreshToken: null,
      error: null,
    })),
    on(authActions.getStorage, (state, { loggedIn, refreshToken }) => ({
      ...state,
      loggedIn: loggedIn,
      refreshToken: refreshToken,
    })),
  ),
});
