export type PackageNetwork = 'MTN' | 'AT' | 'TELECEL';
export type PackageType = 'REGULAR' | 'BIGTIME';
export type PackageExpiry = 'NON_EXPIRY' | 'ROLLOVER_60_DAY' | 'STANDARD';

/** All monetary values are integer pesewas (100 pesewas = GHS 1). */
export interface Package {
  id: string;
  network: PackageNetwork;
  type: PackageType;
  capacityGb: number;
  sizeLabel: string;
  expiryInfo: PackageExpiry;
  isAvailable: boolean;
  wholesalePrice: number;
  suggestedRetailPrice: number;
  retailPrice: number;
  inShop: boolean;
  profit: number;
  marginPercent: number;
  isConfigured: boolean;
}

export interface PackagesResponse {
  message: string;
  data: Package[];
}

export interface PackageResponse {
  message: string;
  data: Package;
}

export interface ApplyMarginModel {
  marginPercent: number;
  network?: PackageNetwork;
}

export interface BulkPriceItem {
  packageId: string;
  retailPrice: number;
}

export interface BulkVisibilityItem {
  packageId: string;
  inShop: boolean;
}

export interface UpdateShopModel {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export interface Shop {
  id: string;
  userId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ShopResponse {
  message: string;
  data: Shop;
}

export interface PackagesState {
  packages: Package[];
  shop: Shop | null;
  isLoading: boolean;
  error: string | null;
}
