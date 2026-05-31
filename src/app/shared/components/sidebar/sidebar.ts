import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Auth } from '../../../core/services/auth/auth';
import { CartService } from '../../../core/services/cart/cart-service';
import { ProductStatsService } from '../../utils/product-shared/product-stats-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public auth = inject(Auth);
  public cart = inject(CartService);
  public statsService = inject(ProductStatsService);

  private router = inject(Router);

  @Input() toggleLogin!: () => void;

  funToggle(): void {
    this.toggleLogin();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
    });
  }
}
