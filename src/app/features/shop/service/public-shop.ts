import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  PublicShopResponse,
  ShopCheckoutModel,
  ShopCheckoutResponse,
} from '../../../core/models/shop.model';
import { OrderResponse } from '../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class PublicShop {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);

  public getShop(slug: string) {
    return this.http.get<PublicShopResponse>(`${this.api}shops/${slug}`);
  }

  public checkout(slug: string, model: ShopCheckoutModel) {
    return this.http.post<ShopCheckoutResponse>(`${this.api}shops/${slug}/checkout`, model);
  }

  public confirm(reference: string) {
    return this.http.post<OrderResponse>(`${this.api}shops/checkout/${reference}/confirm`, {});
  }

  public retry(reference: string) {
    return this.http.post<OrderResponse>(`${this.api}shops/checkout/${reference}/retry`, {});
  }
}
