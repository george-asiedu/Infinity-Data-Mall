import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Table } from '../../../shared/ui/table/table';
import { PageSkeleton } from '../../../shared/ui/page-skeleton/page-skeleton';
import { BulkOrderModal } from './bulk-order-modal/bulk-order-modal';
import { TableColumn } from '../../../core/models/utility.model';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { PackageNetwork, PackageType } from '../../../core/models/package.model';
import { SupplierBalance } from '../../../core/models/xpress.model';
import { ordersActions } from './store/orders.actions';
import { selectIsLoading, selectOrders } from './store/orders.selectors';
import { Xpress } from '../xpress/service/xpress';

type TypeFilter = 'all' | PackageType;
type StatusFilter = 'all' | OrderStatus;

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, PageSkeleton, BulkOrderModal],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersPage implements OnInit {
  private readonly store = inject(Store);
  private readonly xpress = inject(Xpress);

  protected readonly orders = this.store.selectSignal(selectOrders);
  protected readonly isLoading = this.store.selectSignal(selectIsLoading);

  protected readonly firstLoading = computed(() => this.isLoading() && this.orders().length === 0);

  /** Supplier wallet balance, shown as a chip and refreshed with the list. */
  protected readonly balance = signal<SupplierBalance | null>(null);
  protected readonly showBulk = signal<boolean>(false);

  protected readonly activeType = signal<TypeFilter>('all');
  protected readonly activeStatus = signal<StatusFilter>('all');
  protected readonly search = signal<string>('');

  protected readonly columns: TableColumn[] = [
    { field: 'reference', header: 'Reference', width: '130px' },
    { field: 'recipient', header: 'Recipient' },
    { field: 'network', header: 'Network' },
    { field: 'package', header: 'Package' },
    { field: 'amount', header: 'Amount', align: 'right' },
    { field: 'datetime', header: 'Date & Time' },
    { field: 'status', header: 'Status' },
    { field: 'actions', header: '', align: 'right' },
  ];

  protected readonly typeTabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All orders' },
    { key: 'REGULAR', label: 'Regular' },
    { key: 'BIGTIME', label: 'BigTime' },
  ];

  protected readonly statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'FAILED', label: 'Failed' },
  ];

  protected readonly filtered = computed<Order[]>(() => {
    const type = this.activeType();
    const status = this.activeStatus();
    const term = this.search().trim().toLowerCase();

    return this.orders().filter((o) => {
      const typeOk = type === 'all' || o.type === type;
      const statusOk = status === 'all' || o.status === status;
      const searchOk =
        !term ||
        o.id.toLowerCase().includes(term) ||
        o.recipientNumber.includes(term) ||
        o.network.toLowerCase().includes(term);
      return typeOk && statusOk && searchOk;
    });
  });

  ngOnInit(): void {
    this.store.dispatch(ordersActions.loadOrders());
    this.loadBalance();
  }

  private loadBalance(): void {
    this.xpress.getBalance().subscribe({
      next: (res) => this.balance.set(res.data),
      error: () => this.balance.set(null),
    });
  }

  /** Called after a bulk submission to refresh the list and balance. */
  protected onBulkPlaced(): void {
    this.store.dispatch(ordersActions.loadOrders());
    this.loadBalance();
  }

  // ── Helpers ──────────────────────────────────────────────────

  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected logo(net: PackageNetwork): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected typeLabel(t: PackageType): string {
    return t === 'BIGTIME' ? 'BigTime' : 'Regular';
  }
  protected formatPhone(num: string): string {
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  protected statusClass(status: OrderStatus): string {
    if (status === 'DELIVERED') return 'bg-success/10 text-success';
    if (status === 'FAILED') return 'bg-danger/10 text-danger';
    if (status === 'PROCESSING') return 'bg-info/10 text-info';
    return 'bg-warning/10 text-warning';
  }
  protected statusLabel(status: OrderStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  // ── Actions ──────────────────────────────────────────────────

  protected setType(t: TypeFilter): void {
    this.activeType.set(t);
  }
  protected setStatus(s: StatusFilter): void {
    this.activeStatus.set(s);
  }
  protected retry(order: Order): void {
    this.store.dispatch(ordersActions.retryOrder({ orderId: order.id }));
  }
  protected sync(order: Order): void {
    this.store.dispatch(ordersActions.syncOrder({ orderId: order.id }));
  }

  protected exportCsv(): void {
    const header = [
      'Reference',
      'Recipient',
      'Network',
      'Type',
      'Package',
      'Amount (GHS)',
      'Status',
      'Date',
    ];
    const lines = this.filtered().map((o) =>
      [
        o.id,
        o.recipientNumber,
        o.network,
        this.typeLabel(o.type),
        o.sizeLabel,
        this.ghs(o.amount),
        o.status,
        new Date(o.createdAt).toISOString(),
      ].join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idm-orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
