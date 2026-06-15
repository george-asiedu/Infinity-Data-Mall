import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  BulkPriceItem,
  Package,
  Shop,
  UpdateShopModel,
} from '../../../../core/models/package.model';

export const packagesActions = createActionGroup({
  source: 'Packages',
  events: {
    LoadPackages: emptyProps(),
    LoadPackagesSuccess: props<{ packages: Package[] }>(),

    SetVisibility: props<{ packageId: string; inShop: boolean }>(),
    SetVisibilitySuccess: props<{ pkg: Package }>(),

    SaveAllPrices: props<{ items: BulkPriceItem[] }>(),
    SaveAllPricesSuccess: props<{ packages: Package[] }>(),

    LoadShop: emptyProps(),
    LoadShopSuccess: props<{ shop: Shop }>(),

    UpdateShop: props<{ model: UpdateShopModel }>(),
    UpdateShopSuccess: props<{ shop: Shop }>(),

    PackagesError: props<{ error: string }>(),
  },
});
