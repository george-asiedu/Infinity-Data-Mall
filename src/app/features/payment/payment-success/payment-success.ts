import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { ActivatedRoute, Router } from '@angular/router';

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

  // Kept only to flag a clearly broken landing (no reference at all). The
  // Paystack webhook is the single source of truth and activates the account
  // server-side, so this page no longer calls the verify endpoint.
  protected readonly missingReference = signal<boolean>(false);

  ngOnInit(): void {
    const reference = this.route.snapshot.queryParams['reference'];
    this.missingReference.set(!reference);
  }

  protected goToLogin(): void {
    this.router.navigate(['']);
  }
}
