import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Input } from '../../../shared/ui/input/input';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { passwordValidator } from '../../../shared/validators/passwordValidator';
import { emailValidator } from '../../../shared/validators/emailValidator';
import { nameValidator } from '../../../shared/validators/nameValidator';
import { authActions } from '../store/auth.actions';
import { Utility } from '../../../core/services/utility/utility';
import { Router, RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Toast } from '../../../core/services/toast/toast';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-register',
  imports: [Input, Button, CommonModule, ReactiveFormsModule, RouterLink, DialogModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private fb = inject(NonNullableFormBuilder);
  private store = inject(Store);
  protected utilityService = inject(Utility);
  private router = inject(Router);
  private toast = inject(Toast);
  private destroy$ = new Subject<void>();
  private actions$ = inject(Actions);

  protected activeFeature = 0;
  private featureInterval: ReturnType<typeof setInterval> | undefined;

  public showBackupCodeDialog = signal<boolean>(false);
  public backupCode = signal<string>('');

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

  protected registerForm = this.fb.group(
    {
      fullName: ['', [Validators.required, nameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [this.passwordMatchValidator] },
  );

  ngOnInit() {
    this.startFeatureCycle();

    this.actions$
      .pipe(ofType(authActions.registerSuccess), takeUntil(this.destroy$))
      .subscribe(({ registered }) => {
        this.backupCode.set(registered.data.backupCode);
        this.showBackupCodeDialog.set(true);
        this.registerForm.reset();
      });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pass = control.get('password')?.value as string | undefined;
    const confirm = control.get('confirmPassword')?.value as string | undefined;

    if (!pass || !confirm) return null;
    return pass === confirm ? null : { mismatch: true };
  }

  async onSubmit() {
    const model = this.registerForm.getRawValue();

    if (this.registerForm.valid) {
      this.store.dispatch(authActions.register({ model }));
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

  public downloadBackupCode(code: string): void {
    const textContent = `Infinity Data Mall - Backup Code\n\nCode: ${code}\n\nKeep this safe. If you lose access to your authenticator app, you can use this code to log in.`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'idm-backup-code.txt';
    a.click();

    window.URL.revokeObjectURL(url);
    this.toast.success('Backup code downloaded successfully!');
  }

  public continueToVerifyEmail(): void {
    this.showBackupCodeDialog.set(false);
    this.router.navigate(['/verify-email']);
  }

  ngOnDestroy() {
    this.stopFeatureCycle();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
