import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ShopOverview, UpdateShopModel } from '../../../../core/models/shop.model';
import { Shop } from '../../../../core/models/package.model';
import { Order } from '../../../../core/models/order.model';

export const shopActions = createActionGroup({
  source: 'My Shop',
  events: {
    LoadShop: emptyProps(),
    LoadShopSuccess: props<{ shop: Shop }>(),

    LoadOverview: emptyProps(),
    LoadOverviewSuccess: props<{ overview: ShopOverview }>(),

    LoadShopOrders: emptyProps(),
    LoadShopOrdersSuccess: props<{ orders: Order[] }>(),

    UpdateShop: props<{ model: UpdateShopModel }>(),
    UpdateShopSuccess: props<{ shop: Shop }>(),

    ShopError: props<{ error: string }>(),
  },
});
