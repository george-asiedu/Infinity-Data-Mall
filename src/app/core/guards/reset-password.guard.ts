import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, take } from 'rxjs';
import { authActions } from '../../features/auth/store/auth.actions';

export const resetPasswordGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const actions$ = inject(Actions);
  const router = inject(Router);

  const token = route.queryParams['token'] || route.params['token'];
  if (!token) {
    router.navigate(['/forgot-password']);
    return of(false);
  }

  store.dispatch(authActions.verifyToken({ token }));

  return actions$.pipe(
    ofType(authActions.verifyTokenSuccess, authActions.authError),
    take(1),
    map((action) => {
      if (action.type === authActions.verifyTokenSuccess.type) {
        return true;
      } else {
        router.navigate(['/forgot-password']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/forgot-password']);
      return of(false);
    }),
  );
};
