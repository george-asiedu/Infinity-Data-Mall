import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { Table } from '../../../shared/ui/table/table';
import { TableColumn } from '../../../core/models/utility.model';
import {
  BulkPriceItem,
  BulkVisibilityItem,
  Package,
  PackageNetwork,
  PackageType,
} from '../../../core/models/package.model';
import { packagesActions } from './store/packages.actions';
import { selectIsLoading, selectPackages, selectShop } from './store/packages.selectors';
import { paymentActions } from '../../payment/store/payment.actions';
import { selectUser } from '../../auth/store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';

type NetworkFilter = 'all' | PackageNetwork;
type TypeFilter = 'all' | PackageType;
type SortKey = 'default' | 'profit-high' | 'profit-low' | 'margin-high' | 'size-asc';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, Table],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
})
export class PackagesPage implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly toast = inject(Toast);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  protected readonly packages = this.store.selectSignal(selectPackages);
  protected readonly isLoading = this.store.selectSignal(selectIsLoading);
  protected readonly shop = this.store.selectSignal(selectShop);
  private readonly user = this.store.selectSignal(selectUser);

  protected readonly activeNetwork = signal<NetworkFilter>('all');
  protected readonly activeType = signal<TypeFilter>('all');
  protected readonly search = signal<string>('');
  protected readonly marginPercent = signal<number>(20);
  protected readonly sortBy = signal<SortKey>('default');
  protected readonly shopOnly = signal<boolean>(false);
  protected readonly viewMode = signal<'table' | 'grid'>('table');

  // Local drafts overlaying saved values; persisted together on Save.
  protected readonly drafts = signal<Record<string, number>>({});
  protected readonly shopDrafts = signal<Record<string, boolean>>({});

  // Inline edit state.
  protected readonly editingId = signal<string | null>(null);
  protected readonly editValue = signal<number | null>(null);

  protected readonly columns: TableColumn[] = [
    { field: 'package', header: 'Package', width: '230px' },
    { field: 'type', header: 'Type' },
    { field: 'sizeLabel', header: 'Data' },
    { field: 'expiry', header: 'Expiry' },
    { field: 'wholesale', header: 'Wholesale', align: 'right' },
    {
      field: 'retail',
      header: 'My retail price ★',
      align: 'right',
      width: '180px',
    },
    { field: 'profit', header: 'Profit / sale' },
    { field: 'inShop', header: 'In my shop', align: 'center' },
  ];

  protected readonly networkTabs: { key: NetworkFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'MTN', label: 'MTN' },
    { key: 'AT', label: 'AT (iShare)' },
    { key: 'TELECEL', label: 'Telecel' },
  ];

  protected readonly typePills: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All types' },
    { key: 'REGULAR', label: 'Regular' },
    { key: 'BIGTIME', label: 'BigTime' },
  ];

  protected readonly marginChips = [10, 20, 25, 30, 50];

  protected readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'Default order' },
    { key: 'profit-high', label: 'Highest profit first' },
    { key: 'profit-low', label: 'Lowest profit first' },
    { key: 'margin-high', label: 'Highest margin %' },
    { key: 'size-asc', label: 'Data size (small → large)' },
  ];

  // ── Derived per-package values (draft-aware) ─────────────────

  protected retailOf(p: Package): number {
    return this.drafts()[p.id] ?? p.retailPrice;
  }
  protected profitOf(p: Package): number {
    return this.retailOf(p) - p.wholesalePrice;
  }
  protected marginOf(p: Package): number {
    return p.wholesalePrice > 0 ? Math.round((this.profitOf(p) / p.wholesalePrice) * 100) : 0;
  }
  protected inShopOf(p: Package): boolean {
    return this.shopDrafts()[p.id] ?? p.inShop;
  }
  protected isDirty(p: Package): boolean {
    const draft = this.drafts()[p.id];
    return draft !== undefined && draft !== p.retailPrice;
  }

  protected readonly priceDirtyItems = computed<BulkPriceItem[]>(() => {
    const d = this.drafts();
    return this.packages()
      .filter((p) => d[p.id] !== undefined && d[p.id] !== p.retailPrice)
      .map((p) => ({ packageId: p.id, retailPrice: d[p.id] }));
  });
  protected readonly shopDirtyItems = computed<BulkVisibilityItem[]>(() => {
    const d = this.shopDrafts();
    return this.packages()
      .filter((p) => d[p.id] !== undefined && d[p.id] !== p.inShop)
      .map((p) => ({ packageId: p.id, inShop: d[p.id] }));
  });
  protected readonly unsaved = computed(
    () => this.priceDirtyItems().length > 0 || this.shopDirtyItems().length > 0,
  );

  protected readonly filtered = computed<Package[]>(() => {
    const net = this.activeNetwork();
    const type = this.activeType();
    const term = this.search().trim().toLowerCase();
    const shopOnly = this.shopOnly();

    const list = this.packages().filter((p) => {
      const netOk = net === 'all' || p.network === net;
      const typeOk = type === 'all' || p.type === type;
      const shopOk = !shopOnly || p.inShop;
      const searchOk =
        !term ||
        p.sizeLabel.toLowerCase().includes(term) ||
        p.network.toLowerCase().includes(term) ||
        this.typeLabel(p.type).toLowerCase().includes(term);
      return netOk && typeOk && shopOk && searchOk;
    });

    return this.sortList(list);
  });

  private sortList(list: Package[]): Package[] {
    const key = this.sortBy();
    if (key === 'default') return list;
    const copy = [...list];
    if (key === 'profit-high') copy.sort((a, b) => this.profitOf(b) - this.profitOf(a));
    if (key === 'profit-low') copy.sort((a, b) => this.profitOf(a) - this.profitOf(b));
    if (key === 'margin-high') copy.sort((a, b) => this.marginOf(b) - this.marginOf(a));
    if (key === 'size-asc') copy.sort((a, b) => a.wholesalePrice - b.wholesalePrice);
    return copy;
  }

  protected readonly totalCount = computed(() => this.packages().length);
  protected readonly inShopCount = computed(
    () => this.packages().filter((p) => this.inShopOf(p)).length,
  );
  protected readonly avgMargin = computed(() => {
    const list = this.packages();
    if (!list.length) return 0;
    const sum = list.reduce((acc, p) => acc + this.marginOf(p), 0);
    return Math.round(sum / list.length);
  });

  protected networkCount(net: PackageNetwork): number {
    return this.packages().filter((p) => p.network === net).length;
  }

  ngOnInit(): void {
    this.store.dispatch(packagesActions.loadPackages());
    this.store.dispatch(packagesActions.loadShop());

    const userId = this.user()?.id;
    if (userId) this.store.dispatch(paymentActions.getWallet({ userId }));

    // After a successful save the server values catch up — clear local drafts.
    this.actions$
      .pipe(ofType(packagesActions.saveChangesSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.drafts.set({});
        this.shopDrafts.set({});
      });
  }

  // ── Display helpers ──────────────────────────────────────────

  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected typeLabel(type: PackageType): string {
    return type === 'BIGTIME' ? 'BigTime' : 'Regular';
  }
  protected packageName(p: Package): string {
    const typePart = p.type === 'REGULAR' ? '' : ` ${this.typeLabel(p.type)}`;
    return `${p.network}${typePart} ${p.sizeLabel}`;
  }
  protected providerLabel(net: PackageNetwork): string {
    if (net === 'MTN') return 'MTN Ghana';
    if (net === 'AT') return 'AirtelTigo Ghana';
    return 'Telecel Ghana';
  }
  protected logo(net: PackageNetwork): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected expiryLabel(p: Package): string {
    if (p.expiryInfo === 'NON_EXPIRY') return 'Non-expiry';
    if (p.expiryInfo === 'ROLLOVER_60_DAY') return '60-day rollover';
    return 'Standard';
  }
  protected abs(n: number): number {
    return Math.abs(n);
  }
  protected marginBadgeClass(pct: number): string {
    if (pct <= 0) return 'bg-border text-muted';
    if (pct < 10) return 'bg-danger/10 text-danger';
    if (pct < 20) return 'bg-accent/15 text-accent';
    return 'bg-success/10 text-success';
  }

  // ── Filters / view ───────────────────────────────────────────

  protected setNetwork(net: NetworkFilter): void {
    this.activeNetwork.set(net);
  }
  protected setType(type: TypeFilter): void {
    this.activeType.set(type);
  }

  // ── Inline retail editing (local draft) ──────────────────────

  protected startEdit(p: Package): void {
    this.editingId.set(p.id);
    this.editValue.set(Number((this.retailOf(p) / 100).toFixed(2)));
  }
  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editValue.set(null);
  }
  protected saveEdit(p: Package): void {
    const value = this.editValue();
    if (value === null || isNaN(value)) {
      this.toast.error('Enter a valid price.');
      return;
    }
    const pesewas = Math.round(value * 100);
    if (pesewas < p.wholesalePrice) {
      this.toast.error(
        `Retail price cannot be below the wholesale cost (GHS ${this.ghs(p.wholesalePrice)}).`,
      );
      return;
    }
    this.drafts.update((d) => ({ ...d, [p.id]: pesewas }));
    this.cancelEdit();
  }

  // ── Shop visibility (staged, saved in bulk) ──────────────────

  protected toggleShop(p: Package, inShop: boolean): void {
    this.shopDrafts.update((d) => ({ ...d, [p.id]: inShop }));
  }

  /** Stages every package in the current filtered view as in/out of shop. */
  private stageShopForVisible(inShop: boolean): void {
    const ids = this.filtered().map((p) => p.id);
    if (!ids.length) return;
    this.shopDrafts.update((d) => {
      const next = { ...d };
      for (const id of ids) next[id] = inShop;
      return next;
    });
    this.toast.info(
      `${ids.length} package${ids.length > 1 ? 's' : ''} staged — review and Save changes.`,
    );
  }
  protected addAllToShop(): void {
    this.stageShopForVisible(true);
  }
  protected removeAllFromShop(): void {
    this.stageShopForVisible(false);
  }

  protected toggleShopActive(isActive: boolean): void {
    this.store.dispatch(packagesActions.updateShop({ model: { isActive } }));
  }

  // ── Margin tools (local draft) ───────────────────────────────

  protected applyChip(pct: number): void {
    this.marginPercent.set(pct);
    this.applyMargin();
  }

  protected applyMargin(): void {
    const pct = this.marginPercent();
    if (pct === null || isNaN(pct) || pct < 0) {
      this.toast.error('Enter a valid margin percentage.');
      return;
    }
    const net = this.activeNetwork();
    const targets = this.packages().filter((p) => net === 'all' || p.network === net);

    this.drafts.update((d) => {
      const next = { ...d };
      for (const p of targets) {
        next[p.id] = Math.ceil((p.wholesalePrice * (1 + pct / 100)) / 10) * 10;
      }
      return next;
    });
    this.toast.info(`${pct}% margin staged — review and Save changes.`);
  }

  // ── Persist / export ─────────────────────────────────────────

  protected saveAll(): void {
    const priceItems = this.priceDirtyItems();
    const visibilityItems = this.shopDirtyItems();
    if (!priceItems.length && !visibilityItems.length) {
      this.toast.info('No changes to save.');
      return;
    }
    this.store.dispatch(packagesActions.saveChanges({ priceItems, visibilityItems }));
  }

  protected resetDrafts(): void {
    this.drafts.set({});
    this.shopDrafts.set({});
  }

  protected exportCsv(): void {
    const header = [
      'Network',
      'Type',
      'Size',
      'Wholesale (GHS)',
      'Retail (GHS)',
      'Profit (GHS)',
      'Margin (%)',
      'In Shop',
    ];
    const lines = this.packages().map((p) =>
      [
        p.network,
        this.typeLabel(p.type),
        p.sizeLabel,
        this.ghs(p.wholesalePrice),
        this.ghs(this.retailOf(p)),
        this.ghs(this.profitOf(p)),
        this.marginOf(p),
        p.inShop ? 'Yes' : 'No',
      ].join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idm-package-prices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toast.success('Package prices exported.');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
