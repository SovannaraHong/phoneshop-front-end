import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user/user-service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { RoleType, UserType } from '../../core/models/user.model';
interface UserD {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  placeOfBirth: string;
  rolesId: number[];
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  avatarGradient: string;
}

interface Role {
  id: number;
  label: string;
}
@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './user.html',
  styleUrl: './user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User implements OnInit {
  constructor(private authService: UserService) {}
  ngOnInit(): void {
    this.loadUser();
  }
  userList$!: Observable<UserType[]>;
  readonly tabs = ['All', 'Active', 'Inactive', 'Suspended'];

  loadUser() {
    this.userList$ = this.authService.getUser();
  }

  getRolesLabels(userRoles: RoleType[]): string {
    if (!userRoles || userRoles.length === 0) return 'No Role';
    return userRoles.map((r) => r.name).join(', ');
  }

  getActiveUser(users: UserType[]) {
    return users.filter((u) => u.status === 'Active');
  }
  getSuspendedUser(users: UserType[]) {
    return users.filter((u) => u.status === 'Suspended');
  }
}
