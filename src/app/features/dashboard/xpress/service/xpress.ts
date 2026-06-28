import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {
  AfaRegisterModel,
  AfaRegisterResult,
  ApiKeyStatus,
  BulkOrderItem,
  BulkOrderResult,
  DataMessage,
  PurchaseVoucherModel,
  PurchaseVoucherResult,
  SupplierBalance,
  SupplierName,
  VoucherType,
  XpressOffer,
} from '../../../../core/models/xpress.model';
import { OrderResponse } from '../../../../core/models/order.model';

/**
 * Thin HTTP client for the XpresPortal-backed endpoints: personal API key
 * management, supplier balance, offers, vouchers, AFA registration and bulk
 * order placement. State is held with signals in the consuming components.
 */
@Injectable({ providedIn: 'root' })
export class Xpress {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);

  // ── Personal API key ─────────────────────────────────────────

  public getApiKey() {
    return this.http.get<DataMessage<ApiKeyStatus>>(`${this.api}xpress/api-key`);
  }

  public setApiKey(apiKey: string, supplier: SupplierName) {
    return this.http.put<DataMessage<{ preview: string }>>(`${this.api}xpress/api-key`, {
      apiKey,
      supplier,
    });
  }

  public deleteApiKey() {
    return this.http.delete<DataMessage<null>>(`${this.api}xpress/api-key`);
  }

  // ── Balance / offers ─────────────────────────────────────────

  public getBalance() {
    return this.http.get<DataMessage<SupplierBalance>>(`${this.api}xpress/balance`);
  }

  public getOffers() {
    return this.http.get<DataMessage<XpressOffer[]>>(`${this.api}xpress/offers`);
  }

  // ── Vouchers ─────────────────────────────────────────────────

  public listVouchers() {
    return this.http.get<DataMessage<VoucherType[]>>(`${this.api}xpress/vouchers`);
  }

  public purchaseVouchers(model: PurchaseVoucherModel) {
    return this.http.post<DataMessage<PurchaseVoucherResult>>(
      `${this.api}xpress/vouchers/purchase`,
      model,
    );
  }

  // ── AFA ──────────────────────────────────────────────────────

  public registerAfa(model: AfaRegisterModel) {
    return this.http.post<DataMessage<AfaRegisterResult>>(`${this.api}xpress/afa/register`, model);
  }

  // ── Bulk orders ──────────────────────────────────────────────

  public placeBulkOrders(orders: BulkOrderItem[]) {
    return this.http.post<DataMessage<BulkOrderResult>>(`${this.api}orders/bulk`, { orders });
  }

  // ── Single order (re-exposed for convenience) ────────────────

  public placeOrder(model: BulkOrderItem) {
    return this.http.post<OrderResponse>(`${this.api}orders`, model);
  }
}
