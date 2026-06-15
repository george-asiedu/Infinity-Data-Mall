import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {
  BulkPriceItem,
  BulkVisibilityItem,
  PackagesResponse,
  ShopResponse,
} from '../../../../core/models/package.model';

@Injectable({ providedIn: 'root' })
export class Packages {
  private readonly api = environment.apiUrl;
  private readonly http = inject(HttpClient);

  public listPackages() {
    return this.http.get<PackagesResponse>(`${this.api}packages`);
  }

  public bulkSetPrices(items: BulkPriceItem[]) {
    return this.http.post<PackagesResponse>(`${this.api}packages/pricing/bulk`, {
      items,
    });
  }

  public bulkSetVisibility(items: BulkVisibilityItem[]) {
    return this.http.post<PackagesResponse>(`${this.api}packages/visibility/bulk`, {
      items,
    });
  }

  public getMyShop() {
    return this.http.get<ShopResponse>(`${this.api}packages/shop`);
  }

  public updateShop(payload: { name?: string; slug?: string; isActive?: boolean }) {
    return this.http.patch<ShopResponse>(`${this.api}packages/shop`, payload);
  }
}
