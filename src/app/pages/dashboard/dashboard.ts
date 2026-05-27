import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BehaviorSubject, filter, Observable, switchMap } from 'rxjs';
import { UserType } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';

import { CartService } from '../../core/services/cart/cart-service';
import { ProductService } from '../../core/services/product/product-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductType } from '../../core/models/product.model';
import { ProductStatsService } from '../../shared/utils/product-shared/product-stats-service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  public auth = inject(Auth);
  public cart = inject(CartService);
  public statsService = inject(ProductStatsService);

  showProfile = false;
  private router = inject(Router);
  userList$!: Observable<UserType[]>;

  @Input() toggleLogin!: () => void;
  funToggle() {
    this.toggleLogin();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  ngOnInit(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      // scroll the main content area back to top
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
    });
  }
}
