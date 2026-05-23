import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  LoginModel,
  RegisterModel,
  ResetPasswordModel,
  VerifyEmailModel,
  VerifyMfaModel,
} from '../../../core/models/auth.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private api = environment.apiUrl;
  private http = inject(HttpClient);

  public register(model: RegisterModel) {
    return this.http.post(`${this.api}auth/register`, model);
  }

  public checkEmail(email: string) {
    return this.http.post(`${this.api}auth/check-email`, { email });
  }

  public verifyEmail(model: VerifyEmailModel) {
    return this.http.post(`${this.api}auth/verify-email`, model);
  }

  public verifyMfa(model: VerifyMfaModel) {
    return this.http.post(`${this.api}auth/verify-mfa`, model);
  }

  public login(model: LoginModel) {
    return this.http.post(`${this.api}auth/login`, model);
  }

  public requestPasswordReset(email: string) {
    return this.http.post(`${this.api}auth/request-password-reset`, { email });
  }

  public resetPassword(model: ResetPasswordModel) {
    return this.http.post(`${this.api}auth/reset-password`, model);
  }

  public verifyToken(token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.get(`${this.api}auth/verify-token`, { params });
  }

  public refreshToken() {
    return this.http.get(`${this.api}auth/refresh-token`);
  }
}
