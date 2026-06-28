/** Supplier the user's stored key belongs to. */
export type SupplierName = 'VERDEACCESS' | 'XPRESS';

export interface ApiKeyStatus {
  hasOwnKey: boolean;
  supplier: SupplierName;
  preview: string | null;
}

export interface SupplierBalance {
  balance: number;
  currency: string;
  name: string;
}

export interface XpressOffer {
  name: string;
  isp: string;
  type: string; // "Data" | "Airtime" | ...
  description: string;
  offerSlug: string;
  volumes: number[];
}

export interface VoucherType {
  name: string;
  description: string;
  voucherUrl: string;
  slug: string;
}

export interface PurchaseVoucherModel {
  voucherSlug: string;
  quantity: number;
  phone: string;
  email: string;
  sendViaWhatsApp?: boolean;
}

export interface PurchaseVoucherResult {
  transactionId?: string;
  voucherType?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  deliveryPhone?: string;
  deliveryEmail?: string;
}

export interface AfaRegisterModel {
  name: string;
  phoneNumber: string;
  idNumber: string;
  location: string;
  region: string;
  dateOfBirth?: string;
  occupation?: string;
}

export interface AfaRegisterResult {
  registrationId?: string;
  name?: string;
  phoneNumber?: string;
  registrationPrice?: number;
  status?: string;
  submittedAt?: string;
}

export interface BulkOrderItem {
  packageId: string;
  recipientNumber: string;
}

export interface BulkOrderResult {
  placed: number;
  failed: number;
  results: Array<{
    recipientNumber: string;
    packageId: string;
    success: boolean;
    message: string;
  }>;
}

/** Generic { message, data } envelope used by the API. */
export interface DataMessage<T> {
  message: string;
  data: T;
}
