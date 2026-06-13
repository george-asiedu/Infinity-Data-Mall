import { User } from './auth.model';

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  setup: CompleteSetupResponse | null;
  banks: Banks[];
  accounts: any[];
  wallet: any | null;
  activeTx: any | null;
  transactions: any[];
  transactionRef: any | null;
}

export interface BanksResponse {
  status: boolean;
  message: boolean;
  data: Banks[];
}

export interface Banks {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: any;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface VerifyAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface CompleteSetupResponse {
  message: string;
  data: User;
}
