/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { Payment } from '../service/payment';
import { Toast } from '../../../core/services/toast/toast';
import { paymentActions } from './payment.actions';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const initializeTransactionEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.initializeTransaction),
      switchMap(({ model }) =>
        paymentService.initializeTransaction(model).pipe(
          map((response: any) => {
            toast.success(response.message);
            return paymentActions.initializeTransactionSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyBankAccountEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.verifyBankAccount),
      switchMap(({ model }) =>
        paymentService.verifyBankAccount(model).pipe(
          map((response: any) => {
            toast.success(response.message || 'Bank account verified successfully!');
            return paymentActions.verifyBankAccountSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const completeSetupEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.completeSetup),
      switchMap(({ model }) =>
        paymentService.completeSetup(model).pipe(
          map((response: any) => {
            toast.success(response.message || 'Financial setup configuration completed!');
            return paymentActions.completeSetupSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const verifyPaymentTransactionEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.verifyPaymentTransaction),
      switchMap(({ reference }) =>
        paymentService.verifyPaymentTransaction(reference).pipe(
          map((response: any) => {
            toast.success(response.message || 'Transaction successfully processed and cleared!');
            return paymentActions.verifyPaymentTransactionSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);
