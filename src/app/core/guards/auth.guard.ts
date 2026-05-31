import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { AuthState } from '../models/auth.model';
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

const checkAuth = () => {
  const { store, toast } = getDependencies();
  const accessToken = store.selectSignal(selectAccessToken);

  if (!accessToken()) {
    handleUnauthorizedAccess(store, toast);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = () => {
  return checkAuth();
};
