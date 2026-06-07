import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private api = environment.apiUrl;
  private http = inject(HttpClient);

  public register(model: RegisterModel) {
    return this.http.post<RegisterResponse>(`${this.api}auth/register`, model);
  }

  public verifyEmail(model: VerifyEmailModel, origin: string) {
    const headers = new HttpHeaders().set('X-App-Origin', origin);
    return this.http.post<VerifyEmailResponse>(`${this.api}auth/verify-email`, model, { headers });
  }

  public resendVerificationEmail(email: string) {
    return this.http.post<MessageResponse>(`${this.api}auth/resend-verification`, {
      email,
    });
  }

  public resendMfaCode(email: string) {
    return this.http.post<MessageResponse>(`${this.api}auth/resend-mfa-code`, {
      email,
    });
  }

  public verifyMfa(model: VerifyMfaModel) {
    return this.http.post<VerifyMfaResponse>(`${this.api}auth/verify-mfa`, model);
  }

  public login(model: LoginModel) {
    return this.http.post<LoginResponse>(`${this.api}auth/login`, model);
  }

  public loginWithCode(model: LoginViaCodeModel) {
    return this.http.post<VerifyMfaResponse>(`${this.api}auth/login-with-backup-code`, model);
  }

  public requestPasswordReset(email: string, origin: string) {
    const headers = new HttpHeaders().set('origin', origin);
    return this.http.post<MessageResponse>(
      `${this.api}auth/request-password-reset`,
      { email },
      { headers },
    );
  }

  public resetPassword(model: ResetPasswordModel, token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.post<MessageResponse>(`${this.api}auth/reset-password`, model, { params });
  }

  public verifyToken(token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.get<MessageResponse>(`${this.api}auth/verify-token`, { params });
  }

  public refreshToken() {
    return this.http.get<RefreshToken>(`${this.api}auth/refresh-token`);
  }
}
