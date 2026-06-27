/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import PaystackPop from '@paystack/inline-js';
import { environment } from '../../../environments/environment';
import { PublicShop as PublicShopService } from './service/public-shop';
import { PublicPackage, PublicShopProfile } from '../../core/models/shop.model';
import { Order } from '../../core/models/order.model';
import { Toast } from '../../core/services/toast/toast';

type Network = 'MTN' | 'AT' | 'TELECEL';
type Step = 'details' | 'confirm' | 'success';

@Component({
  selector: 'app-public-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-shop.html',
  styleUrl: './public-shop.css',
})
export class PublicShopPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PublicShopService);
  private readonly toast = inject(Toast);

  protected readonly loading = signal<boolean>(true);
  protected readonly notFound = signal<boolean>(false);
  protected readonly shop = signal<PublicShopProfile | null>(null);
  protected readonly packages = signal<PublicPackage[]>([]);

  protected readonly activeNetwork = signal<Network | 'all'>('all');

  // Purchase modal state
  protected readonly modalOpen = signal<boolean>(false);
  protected readonly step = signal<Step>('details');
  protected readonly selected = signal<PublicPackage | null>(null);
  protected readonly recipient = signal<string>('');
  protected readonly confirmRecipient = signal<string>('');
  protected readonly email = signal<string>('');
  protected readonly processing = signal<boolean>(false);
  protected readonly placedOrder = signal<Order | null>(null);
  private slug = '';

  protected readonly networks: { key: Network | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'MTN', label: 'MTN' },
    { key: 'AT', label: 'AT iShare' },
    { key: 'TELECEL', label: 'Telecel' },
  ];

  protected readonly visiblePackages = computed<PublicPackage[]>(() => {
    const net = this.activeNetwork();
    const list = this.packages();
    return net === 'all' ? list : list.filter((p) => p.network === net);
  });

  protected readonly detailsValid = computed<boolean>(() => {
    const r = this.recipient().trim();
    return (
      /^0\d{9}$/.test(r) &&
      r === this.confirmRecipient().trim() &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email().trim())
    );
  });

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.service.getShop(this.slug).subscribe({
      next: (res) => {
        this.shop.set(res.data.shop);
        this.packages.set(res.data.packages);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  // ── Display helpers ──────────────────────────────────────────

  protected ghs(pesewas: number): string {
    return (pesewas / 100).toFixed(2);
  }
  protected logo(net: Network): string {
    if (net === 'MTN') return '/mtn.jpg';
    if (net === 'AT') return '/airtel.png';
    return '/telecel.png';
  }
  protected networkLabel(net: Network): string {
    if (net === 'AT') return 'AT iShare';
    if (net === 'TELECEL') return 'Telecel';
    return 'MTN';
  }
  protected expiryLabel(p: PublicPackage): string {
    if (p.expiryInfo === 'NON_EXPIRY') return 'Non-expiry';
    if (p.expiryInfo === 'ROLLOVER_60_DAY') return '60-day rollover';
    return 'Standard';
  }

  // ── Purchase flow ────────────────────────────────────────────

  protected openPurchase(pkg: PublicPackage): void {
    this.selected.set(pkg);
    this.recipient.set('');
    this.confirmRecipient.set('');
    this.email.set('');
    this.placedOrder.set(null);
    this.step.set('details');
    this.modalOpen.set(true);
  }
  protected closeModal(): void {
    if (this.processing()) return;
    this.modalOpen.set(false);
  }
  protected toConfirm(): void {
    if (!this.detailsValid()) return;
    this.step.set('confirm');
  }
  protected backToDetails(): void {
    this.step.set('details');
  }

  protected payNow(): void {
    const pkg = this.selected();
    if (!pkg) return;
    this.processing.set(true);

    this.service
      .checkout(this.slug, {
        packageId: pkg.id,
        recipientNumber: this.recipient().trim(),
        email: this.email().trim(),
      })
      .subscribe({
        next: (res) => this.launchPaystack(res.data.accessCode, res.data.reference),
        error: () => this.processing.set(false),
      });
  }

  private launchPaystack(accessCode: string, reference: string): void {
    try {
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        key: environment.paystackPublicKey,
        onSuccess: () => this.confirmOrder(reference),
        onCancel: () => {
          this.processing.set(false);
          this.toast.info('Payment window closed.');
        },
      } as any);
    } catch {
      this.processing.set(false);
      this.toast.error('Could not open the payment window. Please try again.');
    }
  }

  private confirmOrder(reference: string): void {
    this.service.confirm(reference).subscribe({
      next: (res) => {
        this.placedOrder.set(res.data);
        this.processing.set(false);
        this.step.set('success');
      },
      error: () => {
        // Payment went through but confirmation/fulfilment failed — let them retry.
        this.placedOrder.set(null);
        this.processing.set(false);
        this.step.set('success');
        this.toast.error('We could not confirm your order. Please retry below.');
        (this as any)._lastReference = reference;
      },
    });
  }

  protected retryOrder(): void {
    const ref = this.placedOrder()?.paystackReference ?? (this as any)._lastReference;
    if (!ref) return;
    this.processing.set(true);
    this.service.retry(ref).subscribe({
      next: (res) => {
        this.placedOrder.set(res.data);
        this.processing.set(false);
      },
      error: () => this.processing.set(false),
    });
  }

  protected statusClass(status: string): string {
    if (status === 'DELIVERED') return 'bg-success/10 text-success';
    if (status === 'FAILED') return 'bg-danger/10 text-danger';
    if (status === 'PROCESSING') return 'bg-info/10 text-info';
    return 'bg-warning/10 text-warning';
  }
}
