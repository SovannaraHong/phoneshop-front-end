import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, Login, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('phoneshop-frontend');
  isLogin = signal(false);

  ngOnInit() {
    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem('accessToken');
    this.isLogin.set(!!token);
  }

  toggleLogin() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isLogin.set(false);
  }
}
