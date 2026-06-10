/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { Payment } from '../service/payment';
import { Toast } from '../../../core/services/toast/toast';
import { paymentActions } from './payment.actions';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { Router } from '@angular/router';

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
          map((response) => {
            toast.success(response.message);
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
  (
    actions$ = inject(Actions),
    paymentService = inject(Payment),
    router = inject(Router),
    toast = inject(Toast),
  ) => {
    return actions$.pipe(
      ofType(paymentActions.completeSetup),
      switchMap(({ model }) =>
        paymentService.completeSetup(model).pipe(
          map((response) => {
            toast.success(response.message);
            router.navigate(['/dashboard']);
            return paymentActions.completeSetupSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const updateSetupEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.updateSetup),
      switchMap(({ model }) =>
        paymentService.updateSetup(model).pipe(
          map((response) => {
            toast.success(response.message);
            return paymentActions.updateSetupSuccess({ response });
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
            toast.success(response.message || 'Transaction successfully processed!');
            return paymentActions.verifyPaymentTransactionSuccess({ response });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const getBanksEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.getBanks),
      switchMap(() =>
        paymentService.getBankList().pipe(
          map((response: any) => {
            return paymentActions.getBanksSuccess({ banks: response.data || [] });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const getAccountsEffect = createEffect(
  (actions$ = inject(Actions), paymentService = inject(Payment), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(paymentActions.getAccounts),
      switchMap(() =>
        paymentService.getAccounts().pipe(
          map((response: any) => {
            toast.success('Sub-accounts retrieved successfully!');
            return paymentActions.getAccountsSuccess({ accounts: response.data || [] });
          }),
          handleApiError((errorMsg) => paymentActions.paymentError({ error: errorMsg }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const clearReferenceEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        paymentActions.verifyPaymentTransactionSuccess,
        paymentActions.completeSetupSuccess,
        paymentActions.updateSetupSuccess,
      ),
      map(() => paymentActions.clearPaymentState()),
    );
  },
  { dispatch: true, functional: true },
);
