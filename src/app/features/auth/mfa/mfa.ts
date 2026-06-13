import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { CommonModule } from '@angular/common';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { authActions } from '../store/auth.actions';
import { Input } from '../../../shared/ui/input/input';
import { selectMfaToken } from '../store/auth.selectors';
import { Toast } from '../../../core/services/toast/toast';
import { Utility } from '../../../core/services/utility/utility';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Input, Button, RouterLink, DialogModule],
  templateUrl: './mfa.html',
  styleUrl: './mfa.css',
})
export class Mfa implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);
  private readonly actions$ = inject(Actions);
  protected readonly utilityService = inject(Utility);
  private readonly destroy$ = new Subject<void>();

  protected readonly isBackupMode = signal<boolean>(false);
  protected readonly email = signal<string>('');

  protected readonly showBackupCodeDialog = signal<boolean>(false);
  protected readonly newBackupCode = signal<string>('');
  private postLoginUser: User | null = null;

  protected mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    backupCode: [
      '',
      [Validators.required, Validators.pattern('^IDM-[A-Za-z0-9]+(-[A-Za-z0-9]+)*$')],
    ],
  });

  private readonly mfaTokenResponse = this.store.selectSignal(selectMfaToken);

  protected toggleVerificationMode(): void {
    this.isBackupMode.update((state) => !state);
  }

  protected readonly resendCountdown = signal<number>(60);
  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCountdown();

    this.actions$
      .pipe(ofType(authActions.loginWithCodeSuccess), takeUntil(this.destroy$))
      .subscribe(({ loggedIn }) => {
        this.postLoginUser = loggedIn.data.user;
        const rotatedCode = loggedIn.data.backupCode;

        if (rotatedCode) {
          this.newBackupCode.set(rotatedCode);
          this.showBackupCodeDialog.set(true);
        } else {
          this.navigateAfterLogin();
        }
      });
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

  protected async onSubmit() {
    const activeControl = this.isBackupMode()
      ? this.getControl('backupCode')
      : this.getControl('code');

    if (!activeControl || activeControl.invalid) {
      activeControl?.markAllAsTouched();
      return;
    }

    const mfaResponse = this.mfaTokenResponse();

    const token = mfaResponse?.data?.mfaToken;
    this.email.set(mfaResponse?.data?.email as string);

    if (!token) {
      this.toast.error('Authentication session expired. Please log in again.');
      this.router.navigate(['']);
      return;
    }

    if (this.isBackupMode()) {
      const backupCode: string = this.mfaForm.getRawValue().backupCode.trim().toUpperCase();
      const model = {
        email: this.email(),
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

  protected onResendCode(): void {
    this.store.dispatch(authActions.resendMfaCode({ email: this.email() }));
    this.startCountdown();
  }

  protected downloadBackupCode(code: string): void {
    const textContent = `Infinity Data Mall - Backup Code\n\nCode: ${code}\n\nKeep this safe. If you lose access to your authenticator app, you can use this code to log in. It replaces any previous backup code.`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'idm-backup-code.txt';
    a.click();

    window.URL.revokeObjectURL(url);
    this.toast.success('Backup code downloaded successfully!');
  }

  protected continueAfterBackup(): void {
    this.showBackupCodeDialog.set(false);
    this.navigateAfterLogin();
  }

  private navigateAfterLogin(): void {
    if (this.postLoginUser?.settlementBankAccount) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/onboarding']);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
