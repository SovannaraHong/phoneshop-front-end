import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  activeTab: 'login' | 'register' = 'login';
  username = '';
  password = '';
  remember = false;
  showPassword = false;
  submitted = false;
  loading = false;
  success = false;

  get usernameError(): boolean {
    return this.submitted && !this.username.trim();
  }
  get passwordError(): boolean {
    return this.submitted && !this.password.trim();
  }

  get passwordStrength(): { width: string; color: string } {
    const v = this.password;
    if (!v) return { width: '0%', color: '#ef4444' };
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const widths = ['25%', '50%', '75%', '100%'];
    return { width: widths[score - 1] || '15%', color: colors[score - 1] || '#ef4444' };
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.submitted = false;
    this.success = false;
    this.username = '';
    this.password = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.success = false;
    if (!this.username.trim() || !this.password.trim()) return;
    this.loading = true;
    // ── Replace with your real auth service call ──
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      console.log('Login:', { username: this.username, remember: this.remember });
    }, 900);
    // ─────────────────────────────────────────────
  }
}
