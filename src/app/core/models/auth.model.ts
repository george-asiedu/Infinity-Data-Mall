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

export interface AuthState {
  isLoading: boolean;
  loggedIn: any | null;
  registered: any | null;
  refreshToken: any | null;
  error: string | null;
}
