/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AuthState,
  LoginModel,
  RegisterModel,
  RegisterResponse,
  ResendVerificationEmailResponse,
  ResetPasswordModel,
  VerifyEmailModel,
  VerifyEmailResponse,
  VerifyMfaModel,
} from '../../../core/models/auth.model';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    Register: props<{ model: RegisterModel }>(),
    RegisterSuccess: props<{ registered: RegisterResponse }>(),

    Login: props<{ model: LoginModel }>(),
    LoginSuccess: props<{ loggedIn: any }>(),

    VerifyEmail: props<{ model: VerifyEmailModel }>(),
    VerifyEmailSuccess: props<{ response: VerifyEmailResponse }>(),

    ResendEmailVerification: props<{ email: string }>(),
    ResendEmailVerificationSuccess: props<{ response: ResendVerificationEmailResponse }>(),

    VerifyMfa: props<{ model: VerifyMfaModel }>(),
    VerifyMfaSuccess: props<{ response: any }>(),

    RequestPasswordReset: props<{ email: string }>(),
    RequestPasswordResetSuccess: props<{ response: any }>(),

    ResetPassword: props<{ model: ResetPasswordModel; token: string }>(),
    ResetPasswordSuccess: props<{ response: any }>(),

    VerifyToken: props<{ token: string }>(),
    VerifyTokenSuccess: props<{ response: any }>(),

    RefreshToken: emptyProps(),
    RefreshTokenSuccess: props<{ refreshToken: any }>(),

    AuthError: props<{ error: string }>(),
    GetStorage: props<AuthState>(),
    Logout: emptyProps(),
  },
});
