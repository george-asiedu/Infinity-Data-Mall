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

  // Top-up reconciliation poll: issues ONE wallet call at a time and only
  // requests another if the webhook hasn't credited yet, up to a small cap.
  private walletPollTimer?: ReturnType<typeof setTimeout>;
  private topUpPollActive = false;
  private topUpAttempts = 0;
  private topUpStartBalance = 0;
  private static readonly MAX_TOPUP_POLLS = 4;

  protected readonly user = this.store.selectSignal(selectUser);
  private readonly walletResponse = this.store.selectSignal(selectWallet);

  protected wallet = computed(() => this.walletResponse()?.wallet);

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

    // Drives the sequential top-up reconciliation poll off each wallet response.
    this.actions$
      .pipe(ofType(paymentActions.getWalletSuccess), takeUntil(this.destroy$))
      .subscribe(() => this.onWalletRefreshed());

    // Stop spinners if the request fails.
    this.actions$
      .pipe(ofType(paymentActions.paymentError), takeUntil(this.destroy$))
      .subscribe(() => {
        this.topUpLoading.set(false);
        this.withdrawLoading.set(false);
        this.stopTopUpPolling();
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
          // server-side. We do NOT call verify here — we reconcile by polling
          // the wallet, one call at a time, until the balance reflects it.
          this.toast.success('Payment received — updating your balance…');
          this.beginTopUpReconciliation();
        },
        onCancel: () => this.toast.info('Payment window closed.'),
      } as any);
    } catch {
      this.toast.error('Could not open the payment window. Please try again.');
    }
  }

  /**
   * Starts reconciling the wallet after a successful top-up. Records the
   * pre-payment balance and schedules the first (single) wallet check; the
   * getWalletSuccess handler decides whether another check is needed.
   */
  private beginTopUpReconciliation(): void {
    this.topUpStartBalance = this.balance();
    this.topUpAttempts = 0;
    this.topUpPollActive = true;
    // First check is timed to land just after the webhook typically credits
    // (~3s), so the happy path is usually a single wallet call.
    this.scheduleWalletCheck(3000);
  }

  /** Reacts to each wallet response while a top-up poll is active. */
  private onWalletRefreshed(): void {
    if (!this.topUpPollActive) return;

    if (this.balance() > this.topUpStartBalance) {
      this.stopTopUpPolling();
      this.toast.success('Your wallet balance has been updated.');
      return;
    }

    if (this.topUpAttempts >= Agent.MAX_TOPUP_POLLS) {
      this.stopTopUpPolling();
      return;
    }

    this.scheduleWalletCheck(2500);
  }

  private scheduleWalletCheck(delay: number): void {
    this.clearWalletPollTimer();
    this.walletPollTimer = setTimeout(() => {
      this.topUpAttempts += 1;
      this.refreshWallet();
    }, delay);
  }

  private stopTopUpPolling(): void {
    this.topUpPollActive = false;
    this.clearWalletPollTimer();
  }

  private clearWalletPollTimer(): void {
    if (this.walletPollTimer) {
      clearTimeout(this.walletPollTimer);
      this.walletPollTimer = undefined;
    }
  }

  private refreshWallet(): void {
    const userId = this.user()?.id;
    if (userId) {
      this.store.dispatch(paymentActions.getWallet({ userId }));
    }
  }

  ngOnDestroy(): void {
    this.stopTopUpPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
