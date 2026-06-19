import { createFeature, createReducer, on } from '@ngrx/store';
import { OrdersState } from '../../../../core/models/order.model';
import { ordersActions } from './orders.actions';

export const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  placing: false,
  lastPlaced: null,
  error: null,
};

/** Inserts a new order at the top, or replaces an existing one by id. */
function upsertOrder(
  state: OrdersState,
  order: OrdersState['orders'][number],
): OrdersState['orders'] {
  const exists = state.orders.some((o) => o.id === order.id);
  return exists
    ? state.orders.map((o) => (o.id === order.id ? order : o))
    : [order, ...state.orders];
}

export const ordersFeature = createFeature({
  name: 'Orders',
  reducer: createReducer(
    initialState,
    on(ordersActions.loadOrders, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ordersActions.loadOrdersSuccess, (state, { orders }) => ({
      ...state,
      isLoading: false,
      orders,
    })),
    on(ordersActions.placeOrder, (state) => ({
      ...state,
      placing: true,
      lastPlaced: null,
      error: null,
    })),
    on(ordersActions.placeOrderSuccess, (state, { order }) => ({
      ...state,
      placing: false,
      lastPlaced: order,
      orders: upsertOrder(state, order),
    })),
    on(ordersActions.placeOrderFailure, (state, { error }) => ({
      ...state,
      placing: false,
      error,
    })),
    on(ordersActions.retryOrderSuccess, ordersActions.syncOrderSuccess, (state, { order }) => ({
      ...state,
      orders: upsertOrder(state, order),
    })),
    on(ordersActions.ordersError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
  ),
});
