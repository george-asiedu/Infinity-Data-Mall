import { createFeature, createReducer, on } from '@ngrx/store';
import { PaymentState } from '../../../core/models/payment.model';
import { paymentActions } from './payment.actions';

export const initialState: PaymentState = {
  isLoading: false,
  error: null,
  reference: null,
  setup: null,
  banks: [],
  accounts: [],
  wallet: null,
  activeTx: null,
  transactions: [],
  transactionRef: null,
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
      paymentActions.updateSetup,
      paymentActions.getBanks,
      paymentActions.getAccounts,
      paymentActions.getWallet,
      paymentActions.getTransactionReference,
      paymentActions.getTransactions,
      paymentActions.getActiveTransaction,
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
      setup: response,
    })),
    on(paymentActions.updateSetupSuccess, (state, { response }) => ({
      ...state,
      isLoading: false,
      setup: response,
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
    on(paymentActions.getBanksSuccess, (state, { banks }) => ({
      ...state,
      isLoading: false,
      banks,
    })),
    on(paymentActions.getAccountsSuccess, (state, { accounts }) => ({
      ...state,
      isLoading: false,
      accounts,
    })),
    on(paymentActions.getWalletSuccess, (state, { wallet }) => ({
      ...state,
      isLoading: false,
      wallet,
    })),
    on(paymentActions.getActiveTransactionSuccess, (state, { activeTx }) => ({
      ...state,
      isLoading: false,
      activeTx,
    })),
    on(paymentActions.getTransactionReferenceSuccess, (state, { transactionRef }) => ({
      ...state,
      isLoading: false,
      transactionRef,
    })),
    on(paymentActions.getTransactionsSuccess, (state, { transactions }) => ({
      ...state,
      isLoading: false,
      transactions,
    })),
    on(paymentActions.getStorage, (state, response) => ({
      ...state,
      ...response,
    })),
    on(paymentActions.clearPaymentState, (state) => ({
      ...state,
      reference: null,
      error: null,
      isLoading: false,
      setup: null,
      activeTx: null,
      transactionRef: null,
    })),
  ),
});
