/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CompleteSetupModel,
  InitializePaymentModel,
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

    VerifyPaymentTransaction: props<{ reference: string }>(),
    VerifyPaymentTransactionSuccess: props<{ response: any }>(),

    PaymentError: props<{ error: string }>(),
    ClearPaymentState: emptyProps(),
  },
});
