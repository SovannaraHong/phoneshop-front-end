import { Injectable, signal } from '@angular/core';
import { LoginResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';

  currentUser = signal<LoginResponse | null>(this.loadUser());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUser(user: LoginResponse) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  // Helper: extracts "Admin" from "ROLE_Admin"
  getRole(): string {
    return (
      this.currentUser()
        ?.data.roles.filter((r) => r.startsWith('ROLE_'))
        .map((r) => r.replace('ROLE_', ''))[0] ?? 'User'
    );
  }

  // Helper: get username
  getUsername(): string {
    return this.currentUser()?.data.username ?? 'Guest';
  }

  loadUser(): LoginResponse | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }
}
