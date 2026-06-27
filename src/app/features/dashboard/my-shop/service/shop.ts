import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ShopOverviewResponse, UpdateShopModel } from '../../../../core/models/shop.model';
import { ShopResponse } from '../../../../core/models/package.model';
import { OrdersResponse } from '../../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class Shop {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);

  public getMyShop() {
    return this.http.get<ShopResponse>(`${this.api}packages/shop`);
  }

  public updateShop(payload: UpdateShopModel) {
    return this.http.patch<ShopResponse>(`${this.api}packages/shop`, payload);
  }

  public getOverview() {
    return this.http.get<ShopOverviewResponse>(`${this.api}shops/me/overview`);
  }

  public getShopOrders() {
    return this.http.get<OrdersResponse>(`${this.api}shops/me/orders`);
  }
}
