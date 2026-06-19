/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import PaystackPop from '@paystack/inline-js';
import { environment } from '../../../../environments/environment';
import { paymentActions } from '../../payment/store/payment.actions';
import { selectWallet, selectTransactions } from '../../payment/store/payment.selectors';
import { selectUser } from '../../auth/store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';
import { AmountDialog } from '../../../shared/ui/amount-dialog/amount-dialog';
import { StatCard } from '../../../core/models/utility.model';
import { PurchaseModal } from '../orders/purchase-modal/purchase-modal';
import { packagesActions } from '../packages/store/packages.actions';
import { selectShop } from '../packages/store/packages.selectors';
import { ordersActions } from '../orders/store/orders.actions';
import { selectOrders } from '../orders/store/orders.selectors';
import { PackageNetwork } from '../../../core/models/package.model';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, RouterLink, AmountDialog, PurchaseModal],
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
  protected readonly shop = this.store.selectSignal(selectShop);
  private readonly allOrders = this.store.selectSignal(selectOrders);
  private readonly allTransactions = this.store.selectSignal(selectTransactions);

  protected wallet = computed(() => this.walletResponse()?.wallet);

  // Quick-sell network tiles (airtime excluded — not in our catalog).
  protected readonly quickSell: {
    network: PackageNetwork;
    name: string;
    desc: string;
    logo: string;
  }[] = [
    { network: 'MTN', name: 'MTN Data', desc: 'Regular & BigTime · Non-expiry', logo: '/mtn.jpg' },
    {
      network: 'AT',
      name: 'AirtelTigo (AT)',
      desc: 'iShare & BigTime · 60-day rollover',
      logo: '/airtel.png',
    },
    { network: 'TELECEL', name: 'Telecel Data', desc: '5GB – 100GB bundles', logo: '/telecel.png' },
  ];

  protected readonly showPurchase = signal<boolean>(false);
  protected readonly purchaseNetwork = signal<PackageNetwork | null>(null);

  protected readonly recentOrders = computed<Order[]>(() => {
    const orders = this.allOrders();
    return Array.isArray(orders) ? orders.slice(0, 5) : [];
  });
  protected readonly recentTransactions = computed<any[]>(() => {
    const transactions = this.allTransactions();
    return Array.isArray(transactions) ? transactions.slice(0, 5) : [];
  });

  // Sample sub-agents — replaced with real data later.
  protected readonly subAgents = [
    {
      initials: 'KA',
      name: 'Kofi Acheampong',
      orders: 34,
      sales: 136,
      color: 'bg-info/10 text-info',
    },
    {
      initials: 'AB',
      name: 'Ama Boateng',
      orders: 28,
      sales: 112,
      color: 'bg-net-at/10 text-net-at',
    },
    {
      initials: 'EO',
      name: 'Efua Osei',
      orders: 21,
      sales: 84,
      color: 'bg-success/10 text-success',
    },
    { initials: 'YD', name: 'Yaw Darko', orders: 19, sales: 76, color: 'bg-accent/15 text-accent' },
  ];

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

    // Dashboard data for the sections below the stats.
    this.store.dispatch(packagesActions.loadPackages());
    this.store.dispatch(packagesActions.loadShop());
    this.store.dispatch(ordersActions.loadOrders());
    const uid = this.user()?.id;
    if (uid) this.store.dispatch(paymentActions.getTransactions({ userId: uid }));

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

  // Quick sell / dashboard sections

  protected openPurchase(network: PackageNetwork): void {
    this.purchaseNetwork.set(network);
    this.showPurchase.set(true);
  }

  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected orderStatusClass(status: OrderStatus): string {
    if (status === 'DELIVERED') return 'bg-success/10 text-success';
    if (status === 'FAILED') return 'bg-danger/10 text-danger';
    if (status === 'PROCESSING') return 'bg-info/10 text-info';
    return 'bg-warning/10 text-warning';
  }
  protected orderStatusLabel(status: OrderStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
  protected formatPhone(num: string): string {
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  protected logo(net: PackageNetwork): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected txnIsCredit(txn: { type?: string }): boolean {
    return txn?.type === 'CREDIT';
  }
  protected txnLabel(txn: { purpose?: string }): string {
    const p = (txn?.purpose ?? '').replace(/_/g, ' ').toLowerCase();
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Transaction';
  }

  ngOnDestroy(): void {
    this.stopTopUpPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
