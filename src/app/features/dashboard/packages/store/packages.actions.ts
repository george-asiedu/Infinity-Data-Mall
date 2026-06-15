import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  BulkPriceItem,
  BulkVisibilityItem,
  Package,
  Shop,
  UpdateShopModel,
} from '../../../../core/models/package.model';

export const packagesActions = createActionGroup({
  source: 'Packages',
  events: {
    LoadPackages: emptyProps(),
    LoadPackagesSuccess: props<{ packages: Package[] }>(),

    SaveChanges: props<{
      priceItems: BulkPriceItem[];
      visibilityItems: BulkVisibilityItem[];
    }>(),
    SaveChangesSuccess: props<{ packages: Package[] }>(),

    LoadShop: emptyProps(),
    LoadShopSuccess: props<{ shop: Shop }>(),

    UpdateShop: props<{ model: UpdateShopModel }>(),
    UpdateShopSuccess: props<{ shop: Shop }>(),

    PackagesError: props<{ error: string }>(),
  },
});
