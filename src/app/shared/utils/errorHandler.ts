import { HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { constants } from './constants';

interface ToastHandler {
  httpError?: (error: HttpErrorResponse, message: string) => void;
}

export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return constants.error;
  }

  // If it's already a string
  if (typeof error === 'string') {
    return error.trim() || constants.error;
  }

  const httpError = error as HttpErrorResponse;

  // Backend returns { message: "..." } in the error body
  if (httpError.error && typeof httpError.error === 'object') {
    const errorBody = httpError.error as Record<string, unknown> | null;

    if (errorBody && typeof errorBody === 'object') {
      const maybeMessage = errorBody['message'];
      const maybeError = errorBody['error'];

      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0)
        return maybeMessage.trim();
      if (typeof maybeError === 'string' && maybeError.trim().length > 0) return maybeError.trim();
    }
  }

  // Error body is a plain string
  if (typeof httpError.error === 'string' && httpError.error.trim().length > 0) {
    return httpError.error.trim();
  }

  // Standard HttpErrorResponse properties
  if (httpError.message && !httpError.message.includes('Http failure')) {
    return httpError.message;
  }

  // Fallback with status code
  if (httpError.status) {
    if (httpError.status === 500) {
      return 'We are experiencing a temporary system issue. Please try again later or contact support.';
    }
    return `Error ${httpError.status}: ${httpError.statusText || 'Unknown error'}`;
  }

  return constants.error;
};

export const handleApiError = <T>(
  actionCreator: (error: string) => unknown,
  toast?: ToastHandler,
) => {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = getErrorMessage(error);

        console.warn(`API Error:`, errorMessage, error);

        if (toast && typeof toast.httpError === 'function') {
          toast.httpError(error, errorMessage);
        }

        return of(actionCreator(errorMessage));
      }),
    );
};
