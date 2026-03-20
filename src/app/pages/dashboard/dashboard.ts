import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  @Input() toggleLogin!: () => void;
  funToggle() {
    this.toggleLogin();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
