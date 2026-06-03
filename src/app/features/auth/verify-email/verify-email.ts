/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Input } from '../../../shared/ui/input/input';
import { authActions } from '../store/auth.actions';
import { delay } from '../../../shared/utils/helpers';
import { Store } from '@ngrx/store';
import { Button } from '../../../shared/ui/button/button';
import { VerifyEmailModel } from '../../../core/models/auth.model';
import { selectRegistrationEmail } from '../store/auth.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Toast } from '../../../core/services/toast/toast';
import { environment } from '../../../../environments/environment';
import PaystackPop from '@paystack/inline-js';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  private readonly toast = inject(Toast);

  private readonly storeEmail = this.store.selectSignal(selectRegistrationEmail);
  private readonly queryEmail = signal<string>(this.route.snapshot.queryParams['email'] || '');

  protected readonly emailEmail = computed(
    () => this.storeEmail() || this.queryEmail() || 'your account',
  );

  protected readonly resendCountdown = signal<number>(60);
  private countdownInterval?: ReturnType<typeof setInterval>;

  protected verifyForm: FormGroup = this.fb.group({
    token: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
  });

  constructor() {
    this.actions$
      .pipe(ofType(authActions.verifyEmailSuccess), takeUntilDestroyed())
      .subscribe(({ response }) => {
        const accessCode = response?.data?.accessCode;
        const reference = response?.data?.reference;

        if (accessCode) {
          this.loadPaystackModal(accessCode, reference);
        } else {
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  private startCountdown(): void {
    this.resendCountdown.set(60);
    this.countdownInterval = setInterval(() => {
      this.resendCountdown.update((time) => {
        if (time <= 1) {
          clearInterval(this.countdownInterval);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  protected async onSubmit(): Promise<void> {
    if (this.verifyForm.invalid) return;

    const model: VerifyEmailModel = {
      email: this.emailEmail(),
      token: this.verifyForm.value.token,
    };

    this.store.dispatch(authActions.verifyEmail({ model }));

    await delay();
    this.verifyForm.reset();
  }

  private loadPaystackModal(accessCode: string, reference: string): void {
    const paystack = new PaystackPop();

    const paymentCallbacks = {
      onSuccess: (response: any) => {
        this.toast.success('Registration fee paid successfully!');
        this.router.navigate(['/payment-success'], {
          queryParams: { reference: reference || response.reference },
        });
      },
      onCancel: () => {
        this.toast.info(
          'Payment window closed. Please complete payment to activate your dashboard.',
        );
        this.router.navigate(['/login']);
      },
    };

    paystack.resumeTransaction(accessCode, paymentCallbacks);
  }

  protected onResendCode(): void {
    this.store.dispatch(authActions.resendEmailVerification({ email: this.emailEmail() }));
    this.startCountdown();
  }

  protected getControl(name: string) {
    return this.verifyForm.get(name);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
