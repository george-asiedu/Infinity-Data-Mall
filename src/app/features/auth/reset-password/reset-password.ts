import { Component, inject, OnInit } from '@angular/core';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../core/services/toast/toast';
import { Store } from '@ngrx/store';
import { authActions } from '../store/auth.actions';
import { delay } from '../../../shared/utils/helpers';
import { ResetPasswordModel } from '../../../core/models/auth.model';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  private token: string | null = null;

  protected resetPasswordForm = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.toast.error('Invalid or missing password reset token.');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  get passwordValue(): string {
    return this.resetPasswordForm.get('newPassword')?.value || '';
  }

  protected getControl(name: string) {
    return this.resetPasswordForm.get(name);
  }

  hasMinLength(): boolean {
    return this.passwordValue.length >= 8;
  }
  hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }
  hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }
  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }
  hasSymbol(): boolean {
    return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\\/?]+/.test(this.passwordValue);
  }

  protected async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const rawValues = this.resetPasswordForm.getRawValue();

    const model: ResetPasswordModel = {
      newPassword: rawValues.newPassword,
      confirmPassword: rawValues.confirmPassword,
    };

    this.store.dispatch(authActions.resetPassword({ model, token: this.token }));

    await delay(500);
    this.resetPasswordForm.reset();
  }
}
