import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AuthState,
  LoginModel,
  LoginResponse,
  LoginViaCodeModel,
  MessageResponse,
  RefreshToken,
  RegisterModel,
  RegisterResponse,
  ResetPasswordModel,
  VerifyEmailModel,
  VerifyEmailResponse,
  VerifyMfaModel,
  VerifyMfaResponse,
} from '../../../core/models/auth.model';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    Register: props<{ model: RegisterModel }>(),
    RegisterSuccess: props<{ registered: RegisterResponse }>(),

    Login: props<{ model: LoginModel }>(),
    LoginSuccess: props<{ mfaToken: LoginResponse }>(),

    LoginWithCode: props<{ model: LoginViaCodeModel }>(),
    LoginWithCodeSuccess: props<{ loggedIn: VerifyMfaResponse }>(),

    VerifyEmail: props<{ model: VerifyEmailModel }>(),
    VerifyEmailSuccess: props<{ response: VerifyEmailResponse }>(),

    ResendEmailVerification: props<{ email: string }>(),
    ResendEmailVerificationSuccess: props<{ response: MessageResponse }>(),

    VerifyMfa: props<{ model: VerifyMfaModel }>(),
    VerifyMfaSuccess: props<{ loggedIn: VerifyMfaResponse }>(),

    RequestPasswordReset: props<{ email: string }>(),
    RequestPasswordResetSuccess: props<{ response: MessageResponse }>(),

    ResetPassword: props<{ model: ResetPasswordModel; token: string }>(),
    ResetPasswordSuccess: props<{ response: MessageResponse }>(),

    VerifyToken: props<{ token: string }>(),
    VerifyTokenSuccess: props<{ response: MessageResponse }>(),

    RefreshToken: emptyProps(),
    RefreshTokenSuccess: props<{ refreshToken: RefreshToken }>(),

    AuthError: props<{ error: string }>(),
    clearAuthState: emptyProps(),
    GetStorage: props<AuthState>(),
    Logout: emptyProps(),
  },
});
