import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user/user-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { RoleType, UserType } from '../../core/models/user.model';
import { UserForm } from '../../content/user-form/user-form';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, UserForm],
  standalone: true,
  templateUrl: './user.html',
  styleUrl: './user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User {
  isOpenForm = false;

  readonly tabs = ['All', 'Active', 'Inactive', 'Suspended'];

  constructor(private authService: UserService) {}

  private refresh$ = new BehaviorSubject<void>(undefined);
  userList$ = this.refresh$.pipe(switchMap(() => this.authService.getUser()));

  reloadUsers(): void {
    this.refresh$.next();
  }

  toggleForm() {
    this.isOpenForm = !this.isOpenForm;
  }
  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.toggleForm();
    }
  }

  loadUser() {
    this.userList$ = this.authService.getUser();
  }
  getStatusUser(user: UserType[], status: string) {
    return user.filter((u) => u.status === status);
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
