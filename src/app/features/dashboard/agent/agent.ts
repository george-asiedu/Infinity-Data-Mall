/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import PaystackPop from '@paystack/inline-js';
import { environment } from '../../../../environments/environment';
import { paymentActions } from '../../payment/store/payment.actions';
import { selectWallet } from '../../payment/store/payment.selectors';
import { selectUser } from '../../auth/store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';
import { AmountDialog } from '../../../shared/ui/amount-dialog/amount-dialog';
import { StatCard } from '../../../core/models/utility.model';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, AmountDialog],
  templateUrl: './agent.html',
  styleUrl: './agent.css',
})
export class Agent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly toast = inject(Toast);
  private readonly destroy$ = new Subject<void>();
  private pollTimers: ReturnType<typeof setTimeout>[] = [];

  protected readonly user = this.store.selectSignal(selectUser);
  private readonly wallet = this.store.selectSignal(selectWallet);

  protected readonly today = new Date();

  protected readonly showTopUp = signal<boolean>(false);
  protected readonly showWithdraw = signal<boolean>(false);
  protected readonly topUpLoading = signal<boolean>(false);
  protected readonly withdrawLoading = signal<boolean>(false);
  protected readonly presets = [10, 20, 50, 100, 200];

  protected readonly balance = computed<number>(() => Number(this.wallet()?.balance ?? 0));

  protected readonly firstName = computed<string>(() => {
    const full = this.user()?.fullName?.trim();
    return full ? full.split(' ')[0] : 'there';
  });

  protected readonly agentCode = computed<string>(() => {
    const id = this.user()?.id ?? '';
    const tail = id
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-4)
      .toUpperCase();
    return tail ? `AG-${tail}` : 'AG-0000';
  });

  protected readonly stats: StatCard[] = [
    {
      label: 'Total orders this month',
      value: '148',
      icon: 'pi-shopping-bag',
      iconClass: 'bg-primary/10 text-primary',
      trend: 12,
    },
    {
      label: 'Total sales this month',
      value: 'GHS 1,240',
      icon: 'pi-credit-card',
      iconClass: 'bg-accent/15 text-accent',
      trend: 18,
    },
    {
      label: 'Sub-agents',
      value: '6',
      icon: 'pi-users',
      iconClass: 'bg-info/10 text-info',
      trend: null,
      badge: '6 active',
    },
    {
      label: 'Shop profit this month',
      value: 'GHS 380',
      icon: 'pi-home',
      iconClass: 'bg-net-at/10 text-net-at',
      trend: -4,
    },
  ];

  ngOnInit(): void {
    this.refreshWallet();

    // Top-up: launch the Paystack inline modal once the gateway returns an access code.
    this.actions$
      .pipe(ofType(paymentActions.topUpWalletSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.topUpLoading.set(false);
        this.showTopUp.set(false);
        this.launchPaystack(response.data.access_code);
      });

    // Withdrawal request accepted (funds held, pending approval).
    this.actions$
      .pipe(ofType(paymentActions.requestWithdrawalSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.withdrawLoading.set(false);
        this.showWithdraw.set(false);
        this.refreshWallet();
      });

    // Stop spinners if the request fails.
    this.actions$
      .pipe(ofType(paymentActions.paymentError), takeUntil(this.destroy$))
      .subscribe(() => {
        this.topUpLoading.set(false);
        this.withdrawLoading.set(false);
      });
  }

  protected onTopUp(amount: number): void {
    this.topUpLoading.set(true);
    this.store.dispatch(paymentActions.topUpWallet({ amount }));
  }

  protected onWithdraw(amount: number): void {
    this.withdrawLoading.set(true);
    this.store.dispatch(paymentActions.requestWithdrawal({ amount }));
  }

  private launchPaystack(accessCode: string): void {
    try {
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        key: environment.paystackPublicKey,
        onSuccess: () => {
          // The Paystack webhook is the source of truth and credits the wallet
          // server-side. We do NOT call verify here — we just poll the wallet a
          // few times to pick up the webhook-applied balance.
          this.toast.success('Payment received — updating your balance…');
          this.pollWalletForCredit();
        },
        onCancel: () => this.toast.info('Payment window closed.'),
      } as any);
    } catch {
      this.toast.error('Could not open the payment window. Please try again.');
    }
  }

  /**
   * Polls the wallet a few times after a successful payment to absorb the small
   * delay before the webhook credits the balance. Stops early once the balance
   * goes up. All timers are cleared on destroy.
   */
  private pollWalletForCredit(): void {
    const startingBalance = this.balance();
    const delays = [2000, 4000, 7000, 12000];

    delays.forEach((delay) => {
      const timer = setTimeout(() => {
        this.refreshWallet();
        if (this.balance() > startingBalance) {
          this.clearWalletPolls();
        }
      }, delay);
      this.pollTimers.push(timer);
    });
  }

  private clearWalletPolls(): void {
    this.pollTimers.forEach((timer) => clearTimeout(timer));
    this.pollTimers = [];
  }

  private refreshWallet(): void {
    const userId = this.user()?.id;
    if (userId) {
      this.store.dispatch(paymentActions.getWallet({ userId }));
    }
  }

  ngOnDestroy(): void {
    this.clearWalletPolls();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
