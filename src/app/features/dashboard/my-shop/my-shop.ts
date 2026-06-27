/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Table } from '../../../shared/ui/table/table';
import { TableColumn } from '../../../core/models/utility.model';
import { Uploads } from '../../../shared/uploads/uploads';
import { AmountDialog } from '../../../shared/ui/amount-dialog/amount-dialog';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { PackageNetwork } from '../../../core/models/package.model';
import { UpdateShopModel } from '../../../core/models/shop.model';
import { shopActions } from './store/shop.actions';
import { selectOrders, selectOverview, selectShop } from './store/shop.selectors';
import { selectWallet } from '../../payment/store/payment.selectors';
import { paymentActions } from '../../payment/store/payment.actions';
import { selectUser } from '../../auth/store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';
import { environment } from '../../../../environments/environment';

type ShopTab = 'overview' | 'orders' | 'settings' | 'payouts';

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, Uploads, AmountDialog],
  templateUrl: './my-shop.html',
  styleUrl: './my-shop.css',
})
export class MyShopPage implements OnInit {
  private readonly store = inject(Store);
  private readonly toast = inject(Toast);

  protected readonly shop = this.store.selectSignal(selectShop);
  protected readonly overview = this.store.selectSignal(selectOverview);
  protected readonly orders = this.store.selectSignal(selectOrders);
  private readonly walletResponse = this.store.selectSignal(selectWallet);
  private readonly user = this.store.selectSignal(selectUser);

  protected readonly activeTab = signal<ShopTab>('overview');
  protected readonly showLogoUpload = signal<boolean>(false);
  protected readonly showWithdraw = signal<boolean>(false);
  protected readonly withdrawLoading = signal<boolean>(false);

  protected readonly walletBalance = computed<number>(() =>
    Number((this.walletResponse() as any)?.wallet?.balance ?? 0),
  );

  // Settings form (seeded from the loaded shop).
  protected readonly form = signal<UpdateShopModel>({});

  protected readonly publicUrl = computed<string>(() => {
    const slug = this.shop()?.slug ?? '';
    const base = environment.shopBaseUrl || window.location.origin;
    return `${base}/shop/${slug}`;
  });

  // Revenue/profit chart geometry derived from the daily series (pesewas).
  protected readonly chart = computed(() => {
    const series = this.overview()?.dailySeries ?? [];
    const w = 700;
    const h = 160;
    const n = series.length;
    const maxPesewas = Math.max(1, ...series.map((p) => Math.max(p.revenue, p.profit)));
    const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * w);
    const y = (v: number) => h - (v / maxPesewas) * h;

    const toPoints = (key: 'revenue' | 'profit') =>
      series.map((p, i) => `${x(i)},${y(p[key])}`).join(' ');

    const revenuePts = toPoints('revenue');
    const revenueArea = n
      ? `M0,${h} L${series.map((p, i) => `${x(i)},${y(p.revenue)}`).join(' L')} L${w},${h} Z`
      : '';

    return {
      w,
      h,
      revenuePts,
      profitPts: toPoints('profit'),
      revenueArea,
      labels: series.map((p) => p.day.slice(5)), // MM-DD
      hasData: maxPesewas > 1,
    };
  });

  protected readonly orderColumns: TableColumn[] = [
    { field: 'package', header: 'Package', width: '210px' },
    { field: 'customer', header: 'Customer' },
    { field: 'paid', header: 'Paid', align: 'right' },
    { field: 'cost', header: 'Your cost', align: 'right' },
    { field: 'profit', header: 'Profit', align: 'right' },
    { field: 'date', header: 'Date' },
    { field: 'status', header: 'Status', align: 'center' },
  ];

  protected readonly tabs: { key: ShopTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'pi-chart-line' },
    { key: 'orders', label: 'Shop orders', icon: 'pi-shopping-bag' },
    { key: 'settings', label: 'Settings', icon: 'pi-cog' },
    { key: 'payouts', label: 'Payouts', icon: 'pi-wallet' },
  ];

  constructor() {
    // Keep the settings form synced when the shop loads.
    effect(() => {
      const s = this.shop();
      if (s) {
        this.form.set({
          name: s.name,
          slug: s.slug,
          tagline: s.tagline ?? '',
          welcomeMessage: s.welcomeMessage ?? '',
          contactPhone: s.contactPhone ?? '',
          whatsapp: s.whatsapp ?? '',
          facebook: s.facebook ?? '',
          instagram: s.instagram ?? '',
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(shopActions.loadShop());
    this.store.dispatch(shopActions.loadOverview());
    this.store.dispatch(shopActions.loadShopOrders());
    const userId = this.user()?.id;
    if (userId) this.store.dispatch(paymentActions.getWallet({ userId }));
  }

  protected setTab(tab: ShopTab): void {
    this.activeTab.set(tab);
  }

  // ── Display helpers ──────────────────────────────────────────

  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected packageName(o: Order): string {
    const t = o.type === 'BIGTIME' ? ' BigTime' : '';
    return `${o.network}${t} ${o.sizeLabel}`;
  }
  protected logo(net: PackageNetwork): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected statusClass(s: OrderStatus): string {
    if (s === 'DELIVERED') return 'bg-success/10 text-success';
    if (s === 'FAILED') return 'bg-danger/10 text-danger';
    if (s === 'PROCESSING') return 'bg-info/10 text-info';
    return 'bg-warning/10 text-warning';
  }
  protected statusLabel(s: OrderStatus): string {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
  protected formatPhone(num: string): string {
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  protected initials(num: string): string {
    return num.slice(-2);
  }

  // ── Identity actions ─────────────────────────────────────────

  protected toggleActive(isActive: boolean): void {
    this.store.dispatch(shopActions.updateShop({ model: { isActive } }));
  }
  protected copyLink(): void {
    navigator.clipboard?.writeText(this.publicUrl()).catch(() => undefined);
    this.toast.success('Shop link copied to clipboard');
  }
  protected shareWhatsApp(): void {
    const text = encodeURIComponent(`Buy data bundles from my shop: ${this.publicUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
  protected visitShop(): void {
    window.open(this.publicUrl(), '_blank');
  }

  // ── Settings ─────────────────────────────────────────────────

  protected patchForm<K extends keyof UpdateShopModel>(key: K, value: UpdateShopModel[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }
  protected saveSettings(): void {
    this.store.dispatch(shopActions.updateShop({ model: this.form() }));
  }
  protected onLogoUploaded(asset: { shortUrl: string }): void {
    this.store.dispatch(shopActions.updateShop({ model: { logoUrl: asset.shortUrl } }));
  }

  // ── Payouts (reuses wallet withdrawal for now) ───────────────

  protected onWithdraw(amount: number): void {
    this.withdrawLoading.set(true);
    this.store.dispatch(paymentActions.requestWithdrawal({ amount }));
    // Optimistically close; the payment store surfaces success/errors via toast.
    this.withdrawLoading.set(false);
    this.showWithdraw.set(false);
  }
}
