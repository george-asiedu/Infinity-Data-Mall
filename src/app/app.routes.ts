import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { resetPasswordGuard } from './core/guards/reset-password.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Infinity Data Mall | Login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'verify-email',
    title: 'Infinity Data Mall | Verify Email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'register',
    title: 'Infinity Data Mall | Register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
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
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/agent/agent').then((m) => m.Agent),
      },
      {
        path: 'packages',
        title: 'Infinity Data Mall | Packages',
        loadComponent: () =>
          import('./features/dashboard/packages/packages').then((m) => m.PackagesPage),
      },
      {
        path: 'orders',
        title: 'Infinity Data Mall | Orders',
        loadComponent: () => import('./features/dashboard/orders/orders').then((m) => m.OrdersPage),
      },
      {
        path: 'my-shop',
        title: 'Infinity Data Mall | My Shop',
        loadComponent: () =>
          import('./features/dashboard/my-shop/my-shop').then((m) => m.MyShopPage),
      },
      {
        path: 'vouchers',
        title: 'Infinity Data Mall | Vouchers',
        loadComponent: () =>
          import('./features/dashboard/vouchers/vouchers').then((m) => m.VouchersPage),
      },
      {
        path: 'afa',
        title: 'Infinity Data Mall | AFA Registration',
        loadComponent: () => import('./features/dashboard/afa/afa').then((m) => m.AfaPage),
      },
      {
        path: 'settings',
        title: 'Infinity Data Mall | Account Settings',
        loadComponent: () =>
          import('./features/dashboard/settings/settings').then((m) => m.SettingsPage),
      },
    ],
  },
  {
    path: 'shop/:slug',
    title: 'Infinity Data Mall | Shop',
    loadComponent: () => import('./features/shop/public-shop').then((m) => m.PublicShopPage),
  },
  {
    path: '**',
    title: 'Infinity Data Mall | Page Not Found',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
