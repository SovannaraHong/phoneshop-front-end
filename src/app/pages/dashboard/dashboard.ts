import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { UserType } from '../../core/models/user.model';
import { UserService } from '../../core/services/user/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(UserService);
  ngOnInit(): void {
    this.userList$ = this.authService.getUser();
  }
  userList$!: Observable<UserType[]>;

  @Input() toggleLogin!: () => void;
  funToggle() {
    this.toggleLogin();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
