import { PackageNetwork, PackageType } from './package.model';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';
export type OrderChannel = 'AGENT_DASHBOARD' | 'SHOP';
export type OrderPaymentMethod = 'WALLET' | 'PAYSTACK';

/** Money is integer pesewas (100 = GHS 1). `id` is the customer-facing reference. */
export interface Order {
  id: string;
  network: PackageNetwork;
  type: PackageType;
  capacityGb: number;
  sizeLabel: string;
  recipientNumber: string;
  amount: number;
  status: OrderStatus;
  channel: OrderChannel;
  paymentMethod: OrderPaymentMethod;
  supplier: string;
  supplierMessage: string | null;
  paystackReference: string | null;
  retryCount: number;
  retryable: boolean;
  createdAt: string;
}

export interface PlaceOrderModel {
  packageId: string;
  recipientNumber: string;
}

export interface OrderResponse {
  message: string;
  data: Order;
}

export interface OrdersResponse {
  message: string;
  data: Order[];
}

export interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  placing: boolean;
  lastPlaced: Order | null;
  error: string | null;
}
