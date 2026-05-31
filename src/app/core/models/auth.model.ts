/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RegisterModel {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailModel {
  token: string;
  email: string;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface ResetPasswordModel {
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyMfaModel {
  mfaToken: string;
  code: string;
}

export interface LoginViaCodeModel {
  email: string;
  backupCode: string;
}

export interface AuthState {
  isLoading: boolean;
  mfaToken: LoginResponse | null;
  loggedIn: VerifyMfaResponse | null;
  registered: RegisterResponse | null;
  registrationEmail: string | null;
  refreshToken: RefreshToken | null;
  error: string | null;
}

export interface RegisterResponse {
  message: string;
  data: {
    userId: string;
    accountStatus: string;
    backupCode: string;
  };
}

export interface VerifyEmailResponse {
  message: string;
  data: {
    accountStatus: string;
    authorizationUrl: string;
    reference: string;
  };
}

export interface LoginResponse {
  message: string;
  data: { mfaToken: string };
}

export interface VerifyMfaResponse {
  message: string;
  data: {
    user: any;
    token: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface RefreshToken {
  data: {
    token: string;
  };
}

export interface MessageResponse {
  message: string;
}
