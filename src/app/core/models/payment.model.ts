export interface VerifyBankAccountModel {
  accountNumber: string;
  bankCode: string;
}

export interface InitializePaymentModel {
  email: string;
  amount: number;
}

export interface CompleteSetupModel {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  vendorApiKey: string;
}

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  reference: string | null;
  setup: unknown | null;
  banks: any[];
  accounts: any[];
}
