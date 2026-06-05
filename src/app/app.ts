import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './shared/components/loader/loader';
import { Toast } from 'primeng/toast';
import { Theme } from './core/services/theme/theme';
import { Store } from '@ngrx/store';
import { selectAuthState } from './features/auth/store/auth.selectors';
import { constants } from './shared/utils/constants';
import { authActions } from './features/auth/store/auth.actions';
import { selectPaymentState } from './features/payment/store/payment.selectors';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:beforeunload)': 'beforeunloadHandler()',
  },
})
export class App implements OnInit {
  protected readonly title = signal('infinity-data-mall');
  private readonly themeService = inject(Theme);
  private store = inject(Store);
  private authState = this.store.selectSignal(selectAuthState);
  private paymentState = this.store.selectSignal(selectPaymentState)
  private key: string = constants.storageKey;

  public beforeunloadHandler(): void {
    const combinedState = {
      auth: this.authState(),
      payment: this.paymentState(),
    };
    localStorage.setItem(this.key, JSON.stringify(combinedState));
  }

  ngOnInit(): void {
    this.themeService.currentTheme();

    const persistState = localStorage.getItem(this.key);
    if (persistState) {
      const storeData = JSON.parse(persistState);

      if (storeData.auth && storeData.merchant) {
        this.store.dispatch(authActions.getStorage(storeData.auth));
      } else {
        this.store.dispatch(authActions.getStorage(storeData));
      }
    }

    localStorage.removeItem(this.key);
  }

  severityIcon(severity: string): string {
    const icons: Record<string, string> = {
      success: 'pi pi-check-circle',
      info: 'pi pi-info-circle',
      warn: 'pi pi-exclamation-triangle',
      error: 'pi pi-times-circle',
      secondary: 'pi pi-bell',
      contrast: 'pi pi-bell',
    };
    return icons[severity] ?? 'pi pi-bell';
  }
}
