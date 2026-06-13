import { paymentFeature } from './payment.reducers';

export const {
  selectPaymentState,
  selectIsLoading,
  selectError,
  selectReference,
  selectSetup,
  selectBanks,
  selectAccounts,
  selectWallet,
  selectActiveTx,
  selectTransactionRef,
  selectTransactions,
} = paymentFeature;
