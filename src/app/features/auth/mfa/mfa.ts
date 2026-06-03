import { Component, inject } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { delay } from '../../../shared/utils/helpers';
import { Store } from '@ngrx/store';
import { authActions } from '../store/auth.actions';
import { Input } from '../../../shared/ui/input/input';
import { selectMfaToken } from '../store/auth.selectors';
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

  protected mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  });

  private readonly mfaTokenResponse = this.store.selectSignal(selectMfaToken);

  protected async onSubmit() {
    if (this.mfaForm.invalid) {
      this.mfaForm.markAllAsTouched();
      return;
    }

    const code = this.mfaForm.getRawValue().code;
    const loginResponse = this.mfaTokenResponse();
    const token = loginResponse?.data?.mfaToken;

    if (!token) {
      this.toast.error('Authentication session expired. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    const model = {
      mfaToken: token,
      code: code,
    };

    this.store.dispatch(authActions.verifyMfa({ model }));

    await delay();
    this.mfaForm.reset();
  }

  protected getControl(name: string) {
    return this.mfaForm.get(name);
  }
}
