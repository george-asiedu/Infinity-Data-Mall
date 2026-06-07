import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../store/auth.actions';
import { Input } from '../../../shared/ui/input/input';
import { selectMfaToken, selectRegistrationEmail } from '../store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink],
  templateUrl: './mfa.html',
  styleUrl: './mfa.css',
})
export class Mfa {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  protected readonly isBackupMode = signal<boolean>(false);
  protected readonly email = this.store.selectSignal(selectRegistrationEmail);

  protected mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    backupCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{2}-[A-Za-z0-9]{6}$')]],
  });

  private readonly mfaTokenResponse = this.store.selectSignal(selectMfaToken);

  protected toggleVerificationMode(): void {
    this.isBackupMode.update((state) => !state);
  }

  protected async onSubmit() {
    const activeControl = this.isBackupMode()
      ? this.getControl('backupCode')
      : this.getControl('code');

    if (!activeControl || activeControl.invalid) {
      activeControl?.markAllAsTouched();
      return;
    }

    const loginResponse = this.mfaTokenResponse();
    const token = loginResponse?.data?.mfaToken;

    if (!token) {
      this.toast.error('Authentication session expired. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.isBackupMode()) {
      const backupCode: string = this.mfaForm.getRawValue().backupCode.trim().toUpperCase();
      const model = {
        email: this.email() as string,
        backupCode: backupCode,
      };
      this.store.dispatch(authActions.loginWithCode({ model }));
    } else {
      const code = this.mfaForm.getRawValue().code.trim();
      const model = {
        mfaToken: token,
        code: code,
      };
      this.store.dispatch(authActions.verifyMfa({ model }));
    }
  }

  protected getControl(name: string) {
    return this.mfaForm.get(name);
  }
}
