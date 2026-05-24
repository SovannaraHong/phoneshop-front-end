import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { UserType } from '../../core/models/user.model';
import { UserService } from '../../core/services/user/user-service';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { trigger } from '@angular/animations';
import { CartService } from '../../core/services/cart/cart-service';

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
  private authService = inject(UserService);
  public auth = inject(Auth);
  public cart = inject(CartService);

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
