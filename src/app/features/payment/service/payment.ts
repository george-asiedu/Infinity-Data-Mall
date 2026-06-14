import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  BanksResponse,
  CompleteSetupModel,
  CompleteSetupResponse,
  InitializePaymentModel,
  VerifyAccountResponse,
  VerifyBankAccountModel,
  WalletResponse,
} from '../../../core/models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class Payment {
  private api = environment.apiUrl;
  private http = inject(HttpClient);

  public verifyPaymentTransaction(reference: string) {
    return this.http.get(`${this.api}payment/verify/${reference}`);
  }

  public initializeTransaction(model: InitializePaymentModel) {
    return this.http.post(`${this.api}payment/initialize`, model);
  }

  public verifyBankAccount(model: VerifyBankAccountModel) {
    return this.http.get<VerifyAccountResponse>(`${this.api}payment/verify-bank`, {
      params: { accountNumber: model.accountNumber, bankCode: model.bankCode },
    });
  }

  public completeSetup(model: CompleteSetupModel) {
    return this.http.post<CompleteSetupResponse>(
      `${this.api}payment/complete-financial-setup`,
      model,
    );
  }

  public updateSetup(model: CompleteSetupModel) {
    return this.http.post<CompleteSetupResponse>(
      `${this.api}payment/update-financial-setup`,
      model,
    );
  }

  public getBankList() {
    return this.http.get<BanksResponse>(`${this.api}payment/banks`);
  }

  public getAccounts() {
    return this.http.get(`${this.api}payment/admin/subaccounts`);
  }

  public getWallet(userId: string) {
    return this.http.get<WalletResponse>(`${this.api}transactions/wallet/${userId}`);
  }

  public getTransaction(id: string) {
    return this.http.get(`${this.api}transactions/detail/${id}`);
  }

  public getTransactionByReference(ref: string) {
    return this.http.get(`${this.api}transactions/reference/${ref}`);
  }

  public getTransactions(userId: string) {
    return this.http.get(`${this.api}transactions/user/${userId}`);
  }

  public topUpWallet(amount: number) {
    return this.http.post(`${this.api}transactions/top-up`, { amount });
  }

  public requestWithdrawal(amount: number) {
    return this.http.post(`${this.api}transactions/withdrawals`, { amount });
  }

  public getMyWithdrawals() {
    return this.http.get(`${this.api}transactions/withdrawals`);
  }
}
