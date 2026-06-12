import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { authActions } from '../../../features/auth/store/auth.actions';
import { Store } from '@ngrx/store';
import { AuthState } from '../../models/auth.model';
import { Auth } from '../../../features/auth/service/auth';
import { selectAccessToken } from '../../../features/auth/store/auth.selectors';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const shouldExcludeToken = (url: string): boolean => {
  if (!url.startsWith(environment.apiUrl)) {
    return true;
  }

  if (url.includes('/auth/user')) {
    return false;
  }

  if (url.includes('/auth')) {
    return true;
  }

  if (url.includes('/payment/webhook')) {
    return true;
  }

  return false;
};

const addBearerToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

const waitForNewToken = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
  refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addBearerToken(req, token))),
  );

const handle401 = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  store: Store<AuthState>,
  authService: Auth,
) => {
  if (isRefreshing) {
    return waitForNewToken(req, next);
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap((response) => {
      isRefreshing = false;
      const newToken = response.data.token;

      if (!newToken) {
        throw new Error('Refresh token response did not contain accessToken');
      }

      store.dispatch(authActions.refreshTokenSuccess({ refreshToken: response }));
      refreshTokenSubject.next(newToken);

      return next(addBearerToken(req, newToken));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      refreshTokenSubject.complete();

      store.dispatch(authActions.logout());
      return throwError(() => refreshError);
    }),
  );
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.url.startsWith(environment.apiUrl)
    ? req.clone({ withCredentials: true })
    : req;

  if (shouldExcludeToken(apiReq.url)) {
    return next(apiReq);
  }

  const store = inject(Store<AuthState>);
  const authService = inject(Auth);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      const authReq = token ? addBearerToken(apiReq, token) : apiReq;

      return next(authReq).pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return handle401(apiReq, next, store, authService);
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};
