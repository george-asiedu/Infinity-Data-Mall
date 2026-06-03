import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../store/auth.actions';
import { delay } from '../../../shared/utils/helpers';
import { emailValidator } from '../../../shared/validators/emailValidator';
import { Utility } from '../../../core/services/utility/utility';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  protected utilityService = inject(Utility);

  protected forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
  });

  protected async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.getRawValue().email;

    this.store.dispatch(authActions.requestPasswordReset({ email }));

    await delay(500);
    this.forgotPasswordForm.reset();
  }

  protected getControl(value: string) {
    return this.forgotPasswordForm.get(value);
  }

  protected getErrorMessage(controlName: string): string {
    return this.utilityService.getErrorMessage(this.getControl(controlName), controlName);
  }
}
