import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Xpress } from '../xpress/service/xpress';
import { Toast } from '../../../core/services/toast/toast';
import { VoucherType } from '../../../core/models/xpress.model';
import { PageSkeleton } from '../../../shared/ui/page-skeleton/page-skeleton';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSkeleton],
  templateUrl: './vouchers.html',
  styleUrl: './vouchers.css',
})
export class VouchersPage implements OnInit {
  private readonly xpress = inject(Xpress);
  private readonly toast = inject(Toast);

  protected readonly vouchers = signal<VoucherType[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly purchasing = signal<boolean>(false);

  // Selection + form
  protected readonly selectedSlug = signal<string>('');
  protected readonly quantity = signal<number>(1);
  protected readonly phone = signal<string>('');
  protected readonly email = signal<string>('');
  protected readonly sendViaWhatsApp = signal<boolean>(false);

  protected readonly selected = computed(() =>
    this.vouchers().find((v) => v.slug === this.selectedSlug()),
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.xpress.listVouchers().subscribe({
      next: (res) => {
        this.vouchers.set(res.data);
        if (res.data.length && !this.selectedSlug()) {
          this.selectedSlug.set(res.data[0].slug);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected select(slug: string): void {
    this.selectedSlug.set(slug);
  }

  protected purchase(): void {
    if (!this.selectedSlug()) {
      this.toast.info('Select a voucher type first.');
      return;
    }
    if (this.quantity() < 1) {
      this.toast.info('Quantity must be at least 1.');
      return;
    }
    if (!/^\d{9,15}$/.test(this.phone().trim())) {
      this.toast.info('Enter a valid delivery phone number.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email().trim())) {
      this.toast.info('Enter a valid delivery email.');
      return;
    }

    this.purchasing.set(true);
    this.xpress
      .purchaseVouchers({
        voucherSlug: this.selectedSlug(),
        quantity: this.quantity(),
        phone: this.phone().trim(),
        email: this.email().trim(),
        sendViaWhatsApp: this.sendViaWhatsApp(),
      })
      .subscribe({
        next: (res) => {
          this.purchasing.set(false);
          const d = res.data;
          this.toast.success(
            d?.totalAmount
              ? `${res.message} · ${d.quantity}× for GHS ${d.totalAmount}`
              : res.message,
          );
          this.resetForm();
        },
        error: (err) => {
          this.purchasing.set(false);
          this.toast.error(err?.error?.message ?? 'Voucher purchase failed.');
        },
      });
  }

  private resetForm(): void {
    this.quantity.set(1);
    this.phone.set('');
    this.email.set('');
    this.sendViaWhatsApp.set(false);
  }
}
