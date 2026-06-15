import { createFeature, createReducer, on } from '@ngrx/store';
import { PackagesState } from '../../../../core/models/package.model';
import { packagesActions } from './packages.actions';

export const initialState: PackagesState = {
  packages: [],
  shop: null,
  isLoading: false,
  error: null,
};

export const packagesFeature = createFeature({
  name: 'Packages',
  reducer: createReducer(
    initialState,
    on(packagesActions.loadPackages, packagesActions.saveAllPrices, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      packagesActions.loadPackagesSuccess,
      packagesActions.saveAllPricesSuccess,
      (state, { packages }) => ({ ...state, isLoading: false, packages }),
    ),
    on(packagesActions.setVisibilitySuccess, (state, { pkg }) => ({
      ...state,
      isLoading: false,
      packages: state.packages.map((p) => (p.id === pkg.id ? pkg : p)),
    })),
    on(packagesActions.loadShopSuccess, packagesActions.updateShopSuccess, (state, { shop }) => ({
      ...state,
      shop,
    })),
    on(packagesActions.packagesError, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
  ),
});
