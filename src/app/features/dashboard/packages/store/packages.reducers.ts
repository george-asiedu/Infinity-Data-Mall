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
    on(packagesActions.loadPackages, packagesActions.saveChanges, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      packagesActions.loadPackagesSuccess,
      packagesActions.saveChangesSuccess,
      (state, { packages }) => ({ ...state, isLoading: false, packages }),
    ),
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
