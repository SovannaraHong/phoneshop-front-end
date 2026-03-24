import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Auth } from './core/services/auth/auth';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, Login, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('phoneshop-frontend');
  isLogin = signal(false);

  constructor(private auth: Auth) {}

  ngOnInit() {
    this.checkToken();
  }

  checkToken() {
    const token = this.auth.getToken();
    this.isLogin.set(!!token);
  }

  toggleLogin() {
    this.auth.logout();
    this.isLogin.set(false);
  }
}
