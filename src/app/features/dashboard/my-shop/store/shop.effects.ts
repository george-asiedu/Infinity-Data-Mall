import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { Shop } from '../service/shop';
import { Toast } from '../../../../core/services/toast/toast';
import { shopActions } from './shop.actions';
import { handleApiError } from '../../../../shared/utils/errorHandler';

export const loadShopEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Shop), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(shopActions.loadShop),
      switchMap(() =>
        service.getMyShop().pipe(
          map((res) => shopActions.loadShopSuccess({ shop: res.data })),
          handleApiError((error) => shopActions.shopError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const loadOverviewEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Shop), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(shopActions.loadOverview),
      switchMap(() =>
        service.getOverview().pipe(
          map((res) => shopActions.loadOverviewSuccess({ overview: res.data })),
          handleApiError((error) => shopActions.shopError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const loadShopOrdersEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Shop), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(shopActions.loadShopOrders),
      switchMap(() =>
        service.getShopOrders().pipe(
          map((res) => shopActions.loadShopOrdersSuccess({ orders: res.data })),
          handleApiError((error) => shopActions.shopError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const updateShopEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Shop), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(shopActions.updateShop),
      switchMap(({ model }) =>
        service.updateShop(model).pipe(
          map((res) => {
            toast.success(res.message);
            return shopActions.updateShopSuccess({ shop: res.data });
          }),
          handleApiError((error) => shopActions.shopError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);
