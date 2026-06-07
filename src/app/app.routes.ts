import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { resetPasswordGuard } from './core/guards/reset-password.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'verify-email',
    title: 'Infinity Data Mall | Verify Email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'login',
    title: 'Infinity Data Mall | Login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'mfa',
    title: 'Infinity Data Mall | OTP',
    loadComponent: () => import('./features/auth/mfa/mfa').then((m) => m.Mfa),
  },
  {
    path: 'forgot-password',
    title: 'Infinity Data Mall | Forgot Password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    title: 'Infinity Data Mall | Reset Password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
    canActivate: [resetPasswordGuard],
  },
  {
    path: 'payment-success',
    loadComponent: () =>
      import('./features/payment/payment-success/payment-success').then((m) => m.PaymentSuccess),
  },
  {
    path: 'complete-registration',
    title: 'Infinity Data Mall | Complete Registration',
    loadComponent: () =>
      import('./features/payment/complete-registration/complete-registration').then(
        (m) => m.CompleteRegistration,
      ),
  },
  {
    path: 'onboarding',
    title: 'Infinity Data Mall | Onboarding',
    loadComponent: () =>
      import('./features/payment/onboarding/onboarding').then((m) => m.Onboarding),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    title: 'Infinity Data Mall | Agent Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
];
