import { Component, computed, inject, model, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DialogModule } from 'primeng/dialog';
import { Package } from '../../../../core/models/package.model';
import { selectPackages } from '../../packages/store/packages.selectors';
import { packagesActions } from '../../packages/store/packages.actions';
import { Xpress } from '../../xpress/service/xpress';
import { Toast } from '../../../../core/services/toast/toast';
import { BulkOrderResult } from '../../../../core/models/xpress.model';

interface Row {
  packageId: string;
  recipientNumber: string;
}

@Component({
  selector: 'app-bulk-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './bulk-order-modal.html',
  styleUrl: './bulk-order-modal.css',
})
export class BulkOrderModal implements OnInit {
  private readonly store = inject(Store);
  private readonly xpress = inject(Xpress);
  private readonly toast = inject(Toast);

  public readonly visible = model<boolean>(false);
  /** Emitted after a bulk submission so the parent can refresh its orders. */
  public readonly placed = output<void>();

  protected readonly packages = this.store.selectSignal(selectPackages);
  protected readonly availablePackages = computed(() =>
    this.packages().filter((p) => p.isAvailable),
  );

  protected readonly rows = signal<Row[]>([{ packageId: '', recipientNumber: '' }]);
  protected readonly submitting = signal<boolean>(false);
  protected readonly result = signal<BulkOrderResult | null>(null);

  ngOnInit(): void {
    if (this.packages().length === 0) {
      this.store.dispatch(packagesActions.loadPackages());
    }
  }

  protected addRow(): void {
    if (this.rows().length >= 50) {
      this.toast.info('You can place up to 50 orders at once.');
      return;
    }
    this.rows.update((r) => [...r, { packageId: '', recipientNumber: '' }]);
  }

  protected removeRow(index: number): void {
    this.rows.update((r) => r.filter((_, i) => i !== index));
  }

  protected setPackage(index: number, packageId: string): void {
    this.rows.update((r) => r.map((row, i) => (i === index ? { ...row, packageId } : row)));
  }

  protected setNumber(index: number, recipientNumber: string): void {
    this.rows.update((r) => r.map((row, i) => (i === index ? { ...row, recipientNumber } : row)));
  }

  protected packageLabel(p: Package): string {
    const type = p.type === 'BIGTIME' ? ' BigTime' : '';
    return `${p.network}${type} · ${p.sizeLabel}`;
  }

  protected submit(): void {
    const valid = this.rows().filter(
      (r) => r.packageId && /^0\d{9}$/.test(r.recipientNumber.trim()),
    );
    if (valid.length === 0) {
      this.toast.info('Add at least one row with a package and a valid 10-digit number.');
      return;
    }

    this.submitting.set(true);
    this.result.set(null);
    this.xpress
      .placeBulkOrders(
        valid.map((r) => ({ packageId: r.packageId, recipientNumber: r.recipientNumber.trim() })),
      )
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.result.set(res.data);
          this.toast.success(res.message);
          this.placed.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(err?.error?.message ?? 'Bulk order failed.');
        },
      });
  }

  protected reset(): void {
    this.rows.set([{ packageId: '', recipientNumber: '' }]);
    this.result.set(null);
  }

  protected close(): void {
    this.visible.set(false);
    this.reset();
  }
}
