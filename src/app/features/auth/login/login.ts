import { Component, inject } from '@angular/core';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from '../../../core/services/utility/utility';
import { emailValidator } from '../../../shared/validators/emailValidator';
import { authActions } from '../store/auth.actions';
import { delay } from '../../../shared/utils/helpers';
import { passwordValidator } from '../../../shared/validators/passwordValidator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly utility = inject(Utility);

  protected loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, passwordValidator()]],
  });

  protected getControl(name: string) {
    return this.loginForm.get(name);
  }

  protected getErrorMessage(controlName: string): string {
    return this.utility.getErrorMessage(this.getControl(controlName), controlName);
  }

  protected async onSubmit() {
    if (this.loginForm.invalid) return;

    const model = this.loginForm.value;
    this.store.dispatch(authActions.login({ model }));

    await delay();
    this.loginForm.reset();
  }
}
