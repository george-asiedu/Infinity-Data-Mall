import { Order } from './order.model';
import { Shop } from './package.model';

export interface ShopMetricBlock {
  orders: number;
  revenue: number; // pesewas
  profit: number; // pesewas
  customers: number;
}

export interface TopPackage {
  sizeLabel: string;
  network: string;
  orders: number;
  revenue: number; // pesewas
}

export interface TopCustomer {
  recipientNumber: string;
  orders: number;
  spent: number; // pesewas
}

export interface DailyPoint {
  day: string;
  revenue: number; // pesewas
  profit: number; // pesewas
}

export interface ShopOverview {
  thisMonth: ShopMetricBlock;
  allTime: ShopMetricBlock;
  topPackages: TopPackage[];
  topCustomers: TopCustomer[];
  recentOrders: Order[];
  dailySeries: DailyPoint[];
}

export interface ShopOverviewResponse {
  message: string;
  data: ShopOverview;
}

export interface UpdateShopModel {
  name?: string;
  slug?: string;
  isActive?: boolean;
  tagline?: string;
  welcomeMessage?: string;
  contactPhone?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  logoUrl?: string;
}

export interface ShopState {
  shop: Shop | null;
  overview: ShopOverview | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

// ── Public storefront (customer-facing) ──
export interface PublicShopProfile {
  name: string;
  slug: string;
  isActive: boolean;
  tagline: string | null;
  welcomeMessage: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  logoUrl: string | null;
}

export interface PublicPackage {
  id: string;
  network: 'MTN' | 'AT' | 'TELECEL';
  type: 'REGULAR' | 'BIGTIME';
  capacityGb: number;
  sizeLabel: string;
  expiryInfo: 'NON_EXPIRY' | 'ROLLOVER_60_DAY' | 'STANDARD';
  price: number; // retail, pesewas
}

export interface PublicShopResponse {
  message: string;
  data: { shop: PublicShopProfile; packages: PublicPackage[] };
}

export interface ShopCheckoutModel {
  packageId: string;
  recipientNumber: string;
  email: string;
  customerName?: string;
}

export interface ShopCheckoutResponse {
  message: string;
  data: { orderId: string; accessCode: string; reference: string };
}
