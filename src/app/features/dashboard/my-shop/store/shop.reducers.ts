import { createFeature, createReducer, on } from '@ngrx/store';
import { ShopState } from '../../../../core/models/shop.model';
import { shopActions } from './shop.actions';

export const initialState: ShopState = {
  shop: null,
  overview: null,
  orders: [],
  isLoading: false,
  error: null,
};

export const shopFeature = createFeature({
  name: 'MyShop',
  reducer: createReducer(
    initialState,
    on(shopActions.loadOverview, shopActions.loadShopOrders, shopActions.updateShop, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(shopActions.loadShopSuccess, shopActions.updateShopSuccess, (state, { shop }) => ({
      ...state,
      isLoading: false,
      shop,
    })),
    on(shopActions.loadOverviewSuccess, (state, { overview }) => ({
      ...state,
      isLoading: false,
      overview,
    })),
    on(shopActions.loadShopOrdersSuccess, (state, { orders }) => ({
      ...state,
      isLoading: false,
      orders,
    })),
    on(shopActions.shopError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
  ),
});
