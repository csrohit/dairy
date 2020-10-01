import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private token: string;
  private user: User;
  private jwtHelper: JwtHelperService;

  constructor(
    private http: HttpClient
  ) {
    this.jwtHelper = new JwtHelperService();
  }

  getMailPreferences(): Observable<string[]> {
    return this.http.get<string[]>('/api/user/mail-preference');
  }
  registerUser(data: User): Observable<User> {
    return this.http.post<User>('/api/user', data);
  }
  authenticateUser(data: { userName: string, password: string }): Observable<any> {
    return this.http.post('/api/user/login', data);
  }
  storeToken(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  loadToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
  }
  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.clear();
  }
  loadUser(): User {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    return this.user;
  }
  isAuthenticated(): boolean {
    this.loadToken();
    console.log(this.token);
    return !this.jwtHelper.isTokenExpired(this.token);
  }
}
