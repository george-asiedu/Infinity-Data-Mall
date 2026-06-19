import { ordersFeature } from './orders.reducers';

export const {
  selectOrdersState,
  selectOrders,
  selectIsLoading,
  selectPlacing,
  selectLastPlaced,
  selectError,
} = ordersFeature;
