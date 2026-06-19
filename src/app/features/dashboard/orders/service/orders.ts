import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {
  OrderResponse,
  OrdersResponse,
  PlaceOrderModel,
} from '../../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class Orders {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);

  public placeOrder(model: PlaceOrderModel) {
    return this.http.post<OrderResponse>(`${this.api}orders`, model);
  }

  public listOrders() {
    return this.http.get<OrdersResponse>(`${this.api}orders`);
  }

  public retryOrder(orderId: string) {
    return this.http.post<OrderResponse>(`${this.api}orders/${orderId}/retry`, {});
  }

  public syncOrder(orderId: string) {
    return this.http.get<OrderResponse>(`${this.api}orders/${orderId}/status`);
  }
}
