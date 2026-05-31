import { Component, inject } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { delay } from '../../../shared/utils/helpers';
import { Store } from '@ngrx/store';
import { authActions } from '../store/auth.actions';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputOtpModule, InputTextModule, Button, RouterLink],
  templateUrl: './mfa.html',
  styleUrl: './mfa.css',
})
export class Mfa {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  });

  protected async onSubmit() {
    if (this.mfaForm.invalid) return;

    const model = {
      mfaToken: this.mfaForm.value.code,
      code: this.mfaForm.value.code,
    };

    this.store.dispatch(authActions.verifyMfa({ model }));

    await delay();
    this.mfaForm.reset();
  }
}
