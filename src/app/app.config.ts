import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideSpinnerConfig } from 'ngx-spinner';
import { loadingInterceptor } from './core/interceptors/loading/loading-interceptor';
import { authFeature } from './features/auth/store/auth.reducers';
import * as AuthEffects from './features/auth/store/auth.effects';
import * as paymentEffects from './features/payment/store/payment.effects';
import { authInterceptor } from './core/interceptors/auth/auth-interceptor';
import { paymentFeature } from './features/payment/store/payment.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    provideStore(),
    provideState(authFeature),
    provideState(paymentFeature),
    provideEffects(AuthEffects, paymentEffects),
    provideSpinnerConfig({ type: 'line-scale-pulse-out' }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      features: {
        pause: false,
        lock: true,
        persist: true,
      },
    }),
  ],
};
