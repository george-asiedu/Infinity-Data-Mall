/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  Banks,
  CompleteSetupModel,
  CompleteSetupResponse,
  InitializePaymentModel,
  PaymentState,
  VerifyAccountResponse,
  VerifyBankAccountModel,
  WalletResponse,
} from '../../../core/models/payment.model';

export const paymentActions = createActionGroup({
  source: 'Payment',
  events: {
    InitializeTransaction: props<{ model: InitializePaymentModel }>(),
    InitializeTransactionSuccess: props<{ response: any }>(),

    VerifyBankAccount: props<{ model: VerifyBankAccountModel }>(),
    VerifyBankAccountSuccess: props<{ response: VerifyAccountResponse }>(),

    CompleteSetup: props<{ model: CompleteSetupModel }>(),
    CompleteSetupSuccess: props<{ response: CompleteSetupResponse }>(),

    UpdateSetup: props<{ model: CompleteSetupModel }>(),
    UpdateSetupSuccess: props<{ response: CompleteSetupResponse }>(),

    VerifyPaymentTransaction: props<{ reference: string }>(),
    VerifyPaymentTransactionSuccess: props<{ response: any }>(),

    GetBanks: emptyProps(),
    GetBanksSuccess: props<{ banks: Banks[] }>(),

    GetAccounts: emptyProps(),
    GetAccountsSuccess: props<{ accounts: any[] }>(),

    GetWallet: props<{ userId: string }>(),
    GetWalletSuccess: props<{ wallet: WalletResponse }>(),

    GetActiveTransaction: props<{ id: string }>(),
    GetActiveTransactionSuccess: props<{ activeTx: any }>(),

    GetTransactions: props<{ userId: string }>(),
    GetTransactionsSuccess: props<{ transactions: any[] }>(),

    GetTransactionReference: props<{ ref: string }>(),
    GetTransactionReferenceSuccess: props<{ transactionRef: any }>(),

    PaymentError: props<{ error: string }>(),
    clearPaymentState: emptyProps(),
    GetStorage: props<PaymentState>(),
  },
});
