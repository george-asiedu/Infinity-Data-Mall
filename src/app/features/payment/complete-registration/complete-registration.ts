/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import PaystackPop from '@paystack/inline-js';
import { Toast } from '../../../core/services/toast/toast';
import { Button } from '../../../shared/ui/button/button';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [Button],
  templateUrl: './complete-registration.html',
  styleUrl: './complete-registration.css',
})
export class CompleteRegistration implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  protected accessCode = '';
  protected reference = '';
  protected email = '';
  protected paymentFailed = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.accessCode = params['accessCode'] || params['access_code'];
      this.reference = params['reference'];
      this.email = params['email'];

      if (this.accessCode) {
        this.loadPaystackModal(this.accessCode, this.reference);
      } else {
        this.router.navigate(['']);
      }
    });
  }

  protected loadPaystackModal(accessCode: string, reference: string): void {
    const paystack = new PaystackPop();

    const paymentOptions = {
      key: environment.paystackPublicKey,
      onSuccess: (response: any) => {
        // The Paystack webhook is the single source of truth — it activates the
        // account server-side. We do NOT call verify here; just land the user on
        // the confirmation page.
        this.router.navigate(['/payment-success'], {
          queryParams: { reference: reference || response.reference },
        });
      },
      onCancel: () => {
        this.toast.info(
          'Payment window closed. Please complete payment to activate your dashboard.',
        );
        this.paymentFailed = true;
      },
    };

    try {
      paystack.resumeTransaction(accessCode, paymentOptions);
    } catch (error) {
      console.error('Paystack failed to load:', error);
      this.paymentFailed = true;
    }
  }
}
