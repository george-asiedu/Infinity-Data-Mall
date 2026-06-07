/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CompleteSetupModel,
  InitializePaymentModel,
  PaymentState,
  VerifyBankAccountModel,
} from '../../../core/models/payment.model';

export const paymentActions = createActionGroup({
  source: 'Payment',
  events: {
    InitializeTransaction: props<{ model: InitializePaymentModel }>(),
    InitializeTransactionSuccess: props<{ response: any }>(),

    VerifyBankAccount: props<{ model: VerifyBankAccountModel }>(),
    VerifyBankAccountSuccess: props<{ response: any }>(),

    CompleteSetup: props<{ model: CompleteSetupModel }>(),
    CompleteSetupSuccess: props<{ response: any }>(),

    UpdateSetup: props<{ model: CompleteSetupModel }>(),
    UpdateSetupSuccess: props<{ response: any }>(),

    VerifyPaymentTransaction: props<{ reference: string }>(),
    VerifyPaymentTransactionSuccess: props<{ response: any }>(),

    GetBanks: emptyProps(),
    GetBanksSuccess: props<{ banks: any[] }>(),

    GetAccounts: emptyProps(),
    GetAccountsSuccess: props<{ accounts: any[] }>(),

    PaymentError: props<{ error: string }>(),
    GetStorage: props<PaymentState>(),
    ClearPaymentState: emptyProps(),
  },
});
