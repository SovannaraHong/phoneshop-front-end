import { Injectable, signal } from '@angular/core';
import { LoginResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';

  currentUser = signal<LoginResponse | null>(null);

  constructor() {
    this.currentUser.set(this.loadUser());
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      console.error('Failed to set token');
    }
  }

  setUser(user: LoginResponse): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    } catch {
      console.error('Failed to set user');
    }
  }

  loadUser(): LoginResponse | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getRole(): string {
    return (
      this.currentUser()
        ?.data.roles.filter((r) => r.startsWith('ROLE_'))
        .map((r) => r.replace('ROLE_', ''))[0] ?? 'User'
    );
  }

  getUsername(): string {
    return this.currentUser()?.data.username ?? 'Guest';
  }

  getUserId(): number | null {
    return this.currentUser()?.data.userId ?? null;
  }

  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch {
      console.error('Failed to clear storage');
    }
    this.currentUser.set(null);
  }

  handleTokenExpired(): void {
    this.logout();
  }
}
