import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Input } from '../../../shared/ui/input/input';
import { authActions } from '../store/auth.actions';
import { delay } from '../../../shared/utils/helpers';
import { Store } from '@ngrx/store';
import { Button } from '../../../shared/ui/button/button';
import { VerifyEmailModel } from '../../../core/models/auth.model';
import { selectRegistrationEmail } from '../store/auth.selectors';

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
