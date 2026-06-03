import { createFeature, createReducer, on } from '@ngrx/store';
import { PaymentState } from '../../../core/models/payment.model';
import { paymentActions } from './payment.actions';

export const initialState: PaymentState = {
  isLoading: false,
  error: null,
  reference: null,
  setup: null,
};

export const paymentFeature = createFeature({
  name: 'Payment',
  reducer: createReducer(
    initialState,
    on(
      paymentActions.initializeTransaction,
      paymentActions.verifyBankAccount,
      paymentActions.completeSetup,
      paymentActions.verifyPaymentTransaction,
      (state) => ({
        ...state,
        isLoading: true,
        error: null,
      }),
    ),
    on(paymentActions.initializeTransactionSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      reference: response.data?.reference || null,
    })),
    on(paymentActions.verifyBankAccountSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      response,
    })),
    on(paymentActions.completeSetupSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      setup: response.data || response,
    })),
    on(paymentActions.verifyPaymentTransactionSuccess, (state) => ({
      ...state,
      isLoading: false,
      reference: null,
    })),
    on(paymentActions.paymentError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(paymentActions.clearPaymentState, () => ({
      ...initialState,
    })),
  ),
});
