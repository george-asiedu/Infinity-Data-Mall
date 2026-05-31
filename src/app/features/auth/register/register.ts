/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { passwordValidator } from '../../../shared/validators/passwordValidator';
import { emailValidator } from '../../../shared/validators/emailValidator';
import { nameValidator } from '../../../shared/validators/nameValidator';
import { authActions } from '../store/auth.actions';
import { Utility } from '../../../core/services/utility/utility';
import { delay } from '../../../shared/utils/helpers';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [Input, Button, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private utilityService = inject(Utility);

  protected activeFeature = 0;
  private featureInterval: any;

  features = [
    {
      icon: 'pi-wifi',
      title: 'Lightning Fast API',
      description:
        'Our infrastructure ensures your customers receive their data instantly, eliminating wait times.',
    },
    {
      icon: 'pi-users',
      title: 'Agent Network',
      description: 'Join thousands of successful agents scaling their data reselling business.',
    },
    {
      icon: 'pi-chart-line',
      title: 'Maximum Margins',
      description:
        'Unlock industry-leading wholesale discounts that guarantee you the highest profit.',
    },
    {
      icon: 'pi-shield',
      title: 'Secure Transactions',
      description: 'Bank-grade encryption protecting your wallet and every transaction.',
    },
  ];

  registerForm: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, nameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit() {
    this.startFeatureCycle();
  }

  passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    const pass = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;

    if (!pass || !confirm) return null;
    return pass === confirm ? null : { mismatch: true };
  }

  async onSubmit() {
    const model = this.registerForm.value;

    if (this.registerForm.valid) {
      this.store.dispatch(authActions.register({ model }));
      await delay(500);
      this.registerForm.reset();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  protected getControl(value: string) {
    return this.registerForm.get(value);
  }

  protected getErrorMessage(controlName: string): string {
    return this.utilityService.getErrorMessage(this.getControl(controlName), controlName);
  }

  get passwordValue(): string {
    return this.registerForm.value.password || '';
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

  startFeatureCycle() {
    this.featureInterval = setInterval(() => {
      this.activeFeature = (this.activeFeature + 1) % this.features.length;
    }, 4000);
  }

  stopFeatureCycle() {
    if (this.featureInterval) {
      clearInterval(this.featureInterval);
    }
  }

  setActiveFeature(index: number) {
    this.activeFeature = index;
    this.stopFeatureCycle();
    this.startFeatureCycle();
  }

  ngOnDestroy() {
    this.stopFeatureCycle();
  }
}
