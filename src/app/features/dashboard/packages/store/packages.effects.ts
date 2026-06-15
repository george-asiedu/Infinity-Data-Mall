import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, of, switchMap } from 'rxjs';
import { Packages } from '../service/packages';
import { Toast } from '../../../../core/services/toast/toast';
import { packagesActions } from './packages.actions';
import { handleApiError } from '../../../../shared/utils/errorHandler';
import { PackagesResponse } from '../../../../core/models/package.model';

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

/**
 * Persists staged price + shop-visibility changes in a single user action.
 * The two bulk endpoints run sequentially so the final response reflects every
 * change; whichever runs last returns the authoritative package list.
 */
export const saveChangesEffect = createEffect(
  (actions$ = inject(Actions), service = inject(Packages), toast = inject(Toast)) => {
    return actions$.pipe(
      ofType(packagesActions.saveChanges),
      switchMap(({ priceItems, visibilityItems }) => {
        const price$ = priceItems.length
          ? service.bulkSetPrices(priceItems)
          : of<PackagesResponse | null>(null);

        return price$.pipe(
          switchMap((priceRes) => {
            if (!visibilityItems.length) {
              return of(priceRes as PackagesResponse);
            }
            return service.bulkSetVisibility(visibilityItems);
          }),
          map((res) => {
            toast.success('Changes saved successfully');
            return packagesActions.saveChangesSuccess({ packages: res.data });
          }),
          handleApiError((error) => packagesActions.packagesError({ error }), toast),
        );
      }),
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
