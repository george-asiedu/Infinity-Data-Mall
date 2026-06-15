import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {
  ApplyMarginModel,
  BulkPriceItem,
  PackageResponse,
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

  public setRetailPrice(packageId: string, retailPrice: number) {
    return this.http.patch<PackageResponse>(`${this.api}packages/${packageId}/pricing`, {
      retailPrice,
    });
  }

  public setVisibility(packageId: string, inShop: boolean) {
    return this.http.patch<PackageResponse>(`${this.api}packages/${packageId}/visibility`, {
      inShop,
    });
  }

  public applyMargin(model: ApplyMarginModel) {
    return this.http.post<PackagesResponse>(`${this.api}packages/apply-margin`, model);
  }

  public bulkSetPrices(items: BulkPriceItem[]) {
    return this.http.post<PackagesResponse>(`${this.api}packages/pricing/bulk`, {
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
