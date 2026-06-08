import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { delay } from 'rxjs';
import { paymentActions } from '../store/payment.actions';
import { selectError } from '../store/payment.selectors';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccess implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  protected readonly isVerifying = signal<boolean>(true);
  protected readonly verificationFailed = signal<boolean>(false);
  private readonly storeError = this.store.selectSignal(selectError);

  ngOnInit(): void {
    this.extractAndVerifyPayment();
  }

  private async extractAndVerifyPayment(): Promise<void> {
    const reference = this.route.snapshot.queryParams['reference'];

    if (!reference) {
      this.isVerifying.set(false);
      this.verificationFailed.set(true);
      return;
    }

    this.store.dispatch(paymentActions.verifyPaymentTransaction({ reference }));

    await delay(2500);

    if (this.storeError()) {
      this.verificationFailed.set(true);
    }
    this.isVerifying.set(false);
  }

  protected goToLogin(): void {
    this.router.navigate(['']);
  }
}
