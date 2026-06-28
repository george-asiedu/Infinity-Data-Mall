import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Xpress } from '../xpress/service/xpress';
import { Toast } from '../../../core/services/toast/toast';
import { ApiKeyStatus, SupplierBalance, SupplierName } from '../../../core/models/xpress.model';
import { PageSkeleton } from '../../../shared/ui/page-skeleton/page-skeleton';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSkeleton],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsPage implements OnInit {
  private readonly xpress = inject(Xpress);
  private readonly toast = inject(Toast);

  protected readonly status = signal<ApiKeyStatus | null>(null);
  protected readonly balance = signal<SupplierBalance | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly saving = signal<boolean>(false);

  // Form state
  protected readonly supplier = signal<SupplierName>('XPRESS');
  protected readonly apiKey = signal<string>('');
  protected readonly showKey = signal<boolean>(false);

  protected readonly suppliers: { value: SupplierName; label: string }[] = [
    { value: 'XPRESS', label: 'XpresPortal' },
    { value: 'VERDEACCESS', label: 'Verdeaccess' },
  ];

  protected readonly usingPlatformKey = computed(() => !this.status()?.hasOwnKey);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.xpress.getApiKey().subscribe({
      next: (res) => {
        this.status.set(res.data);
        this.supplier.set(res.data.supplier ?? 'XPRESS');
        this.loading.set(false);
        this.loadBalance();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadBalance(): void {
    this.xpress.getBalance().subscribe({
      next: (res) => this.balance.set(res.data),
      // Balance is best-effort; a missing/invalid key just hides it.
      error: () => this.balance.set(null),
    });
  }

  protected save(): void {
    const key = this.apiKey().trim();
    if (key.length < 8) {
      this.toast.info('Enter a valid API key (at least 8 characters).');
      return;
    }
    this.saving.set(true);
    this.xpress.setApiKey(key, this.supplier()).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.apiKey.set('');
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Could not save your API key.');
      },
    });
  }

  protected remove(): void {
    this.saving.set(true);
    this.xpress.deleteApiKey().subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Could not remove your API key.');
      },
    });
  }

  protected supplierLabel(value: SupplierName | undefined): string {
    return this.suppliers.find((s) => s.value === value)?.label ?? 'XpresPortal';
  }
}
