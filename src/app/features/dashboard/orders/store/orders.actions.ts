import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Order, PlaceOrderModel } from '../../../../core/models/order.model';

export const ordersActions = createActionGroup({
  source: 'Orders',
  events: {
    LoadOrders: emptyProps(),
    LoadOrdersSuccess: props<{ orders: Order[] }>(),

    PlaceOrder: props<{ model: PlaceOrderModel }>(),
    PlaceOrderSuccess: props<{ order: Order }>(),
    PlaceOrderFailure: props<{ error: string }>(),

    RetryOrder: props<{ orderId: string }>(),
    RetryOrderSuccess: props<{ order: Order }>(),

    SyncOrder: props<{ orderId: string }>(),
    SyncOrderSuccess: props<{ order: Order }>(),

    OrdersError: props<{ error: string }>(),
  },
});
