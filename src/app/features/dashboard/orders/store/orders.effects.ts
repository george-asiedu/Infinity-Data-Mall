import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { Orders } from '../service/orders';
import { Toast } from '../../../../core/services/toast/toast';
import { ordersActions } from './orders.actions';
import { handleApiError } from '../../../../shared/utils/errorHandler';

export const loadOrdersEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Orders), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(ordersActions.loadOrders),
      switchMap(() =>
        service.listOrders().pipe(
          map((res) => ordersActions.loadOrdersSuccess({ orders: res.data })),
          handleApiError((error) => ordersActions.ordersError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const placeOrderEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Orders), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(ordersActions.placeOrder),
      switchMap(({ model }) =>
        service.placeOrder(model).pipe(
          map((res) => {
            toast.success(res.message);
            return ordersActions.placeOrderSuccess({ order: res.data });
          }),
          handleApiError((error) => ordersActions.placeOrderFailure({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const retryOrderEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Orders), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(ordersActions.retryOrder),
      switchMap(({ orderId }) =>
        service.retryOrder(orderId).pipe(
          map((res) => {
            toast.success(res.message);
            return ordersActions.retryOrderSuccess({ order: res.data });
          }),
          handleApiError((error) => ordersActions.ordersError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const syncOrderEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Orders), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(ordersActions.syncOrder),
      switchMap(({ orderId }) =>
        service.syncOrder(orderId).pipe(
          map((res) => ordersActions.syncOrderSuccess({ order: res.data })),
          handleApiError((error) => ordersActions.ordersError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);
