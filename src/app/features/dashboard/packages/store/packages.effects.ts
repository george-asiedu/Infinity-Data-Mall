import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { Packages } from '../service/packages';
import { Toast } from '../../../../core/services/toast/toast';
import { packagesActions } from './packages.actions';
import { handleApiError } from '../../../../shared/utils/errorHandler';

export const loadPackagesEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.loadPackages),
      switchMap(() =>
        service.listPackages().pipe(
          map((res) => packagesActions.loadPackagesSuccess({ packages: res.data })),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const setVisibilityEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.setVisibility),
      switchMap(({ packageId, inShop }) =>
        service.setVisibility(packageId, inShop).pipe(
          map((res) => {
            toast.success(res.message);
            return packagesActions.setVisibilitySuccess({ pkg: res.data });
          }),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const saveAllPricesEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.saveAllPrices),
      switchMap(({ items }) =>
        service.bulkSetPrices(items).pipe(
          map((res) => {
            toast.success(res.message);
            return packagesActions.saveAllPricesSuccess({ packages: res.data });
          }),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const loadShopEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.loadShop),
      switchMap(() =>
        service.getMyShop().pipe(
          map((res) => packagesActions.loadShopSuccess({ shop: res.data })),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);

export const updateShopEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.updateShop),
      switchMap(({ model }) =>
        service.updateShop(model).pipe(
          map((res) => {
            toast.success(res.message);
            return packagesActions.updateShopSuccess({ shop: res.data });
          }),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        ),
      ),
    );
  },
  { dispatch: true, functional: true },
);
