/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { Package, PackageNetwork } from '../../../../core/models/package.model';
import { Order } from '../../../../core/models/order.model';
import { selectPackages } from '../../packages/store/packages.selectors';
import { selectWallet } from '../../../payment/store/payment.selectors';
import { ordersActions } from '../store/orders.actions';
import { selectPlacing } from '../store/orders.selectors';

type Step = 1 | 2 | 3 | 'success';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './purchase-modal.html',
  styleUrl: './purchase-modal.css',
})
export class PurchaseModal implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  public readonly visible = model<boolean>(false);
  public readonly network = input<PackageNetwork | null>(null);

  private readonly allPackages = this.store.selectSignal(selectPackages);
  private readonly walletResponse = this.store.selectSignal(selectWallet);
  protected readonly placing = this.store.selectSignal(selectPlacing);

  protected readonly step = signal<Step>(1);
  protected readonly selected = signal<Package | null>(null);
  protected readonly recipient1 = signal<string>('');
  protected readonly recipient2 = signal<string>('');
  protected readonly placedOrder = signal<Order | null>(null);

  protected readonly walletBalance = computed<number>(() =>
    Number((this.walletResponse() as any)?.wallet?.balance ?? 0),
  );

  protected readonly packages = computed<Package[]>(() => {
    const net = this.network();
    return this.allPackages()
      .filter((p) => p.isAvailable && (!net || p.network === net))
      .slice()
      .sort((a, b) => a.wholesalePrice - b.wholesalePrice);
  });

  protected readonly cost = computed<number>(() =>
    this.selected() ? this.selected()!.wholesalePrice : 0,
  );
  protected readonly costGhs = computed<number>(() => this.cost() / 100);
  protected readonly balanceAfter = computed<number>(() => this.walletBalance() - this.costGhs());
  protected readonly insufficient = computed<boolean>(
    () => this.selected() !== null && this.balanceAfter() < 0,
  );

  protected readonly recipientValid = computed<boolean>(() => {
    const r1 = this.recipient1().trim();
    const r2 = this.recipient2().trim();
    return /^0\d{9}$/.test(r1) && r1 === r2;
  });
  protected readonly recipientMismatch = computed<boolean>(() => {
    const r1 = this.recipient1().trim();
    const r2 = this.recipient2().trim();
    return r1.length >= 10 && r2.length >= 10 && r1 !== r2;
  });

  ngOnInit(): void {
    this.actions$
      .pipe(ofType(ordersActions.placeOrderSuccess), takeUntil(this.destroy$))
      .subscribe(({ order }) => {
        this.placedOrder.set(order);
        this.step.set('success');
      });
  }

  // Display helpers

  protected logo(net: PackageNetwork): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected networkLabel(net: PackageNetwork | null): string {
    if (net === 'MTN') return 'MTN Data';
    if (net === 'AT') return 'AirtelTigo (AT)';
    if (net === 'TELECEL') return 'Telecel Data';
    return 'Data Bundle';
  }
  protected typeLabel(p: Package): string {
    return p.type === 'BIGTIME' ? 'BigTime' : 'Regular';
  }
  protected expiryLabel(p: Package): string {
    if (p.expiryInfo === 'NON_EXPIRY') return 'Non-expiry';
    if (p.expiryInfo === 'ROLLOVER_60_DAY') return '60-day rollover';
    return 'Standard';
  }
  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected formatPhone(num: string): string {
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  // Navigation

  protected selectPackage(p: Package): void {
    this.selected.set(p);
  }

  protected goTo(step: Step): void {
    this.step.set(step);
  }

  protected confirm(): void {
    const pkg = this.selected();
    if (!pkg || !this.recipientValid() || this.insufficient()) return;
    this.store.dispatch(
      ordersActions.placeOrder({
        model: { packageId: pkg.id, recipientNumber: this.recipient1().trim() },
      }),
    );
  }

  protected onHide(): void {
    this.reset();
  }
  protected close(): void {
    this.visible.set(false);
  }
  private reset(): void {
    this.step.set(1);
    this.selected.set(null);
    this.recipient1.set('');
    this.recipient2.set('');
    this.placedOrder.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
