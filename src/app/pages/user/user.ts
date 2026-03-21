import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, // step 1 inject service
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user/user-service';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
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
export class User implements OnInit {
  // ── step 1: inject services ──────────────────────────────────
  private authService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private refresh$ = new BehaviorSubject<void>(undefined);

  // ── step 2: declare state ─────────────────────────────────────
  userList$!: Observable<UserType[]>;
  isOpenForm = false;
  selectedTab = signal<string>('All');
  selectedUser = signal<UserType | null>(null);
  showToast = signal(false);
  toastMessage = signal('');

  readonly tabs = ['All', 'Active', 'Inactive', 'Suspended'];

  // ── step 3: lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.userList$ = this.refresh$.pipe(switchMap(() => this.authService.getUser()));
  }

  // ── step 4: toast helper ──────────────────────────────────────
  private showSuccess(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    this.cdr.markForCheck(); // force OnPush to re-render
    setTimeout(() => {
      this.showToast.set(false);
      this.cdr.markForCheck();
    }, 4000);
  }

  // ── step 5: form open/close ───────────────────────────────────
  openFormCreate(): void {
    this.selectedUser.set(null);
    this.isOpenForm = true;
  }

  openFormEdit(user: UserType): void {
    this.selectedUser.set(user);
    this.isOpenForm = true;
  }

  toggleForm(): void {
    this.isOpenForm = !this.isOpenForm;
    if (!this.isOpenForm) {
      this.selectedUser.set(null);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.toggleForm();
    }
  }

  // ── step 6: called when user-form emits userCreated ───────────
  onUserCreated(): void {
    const isEdit = !!this.selectedUser(); // check before closing
    this.reloadUsers();
    this.toggleForm();
    this.showSuccess(isEdit ? 'User updated successfully!' : 'User created successfully!');
  }

  // ── step 7: crud actions ──────────────────────────────────────
  reloadUsers(): void {
    this.refresh$.next();
  }

  deleteUser(id: number): void {
    this.authService.deleteUser(id).subscribe({
      next: () => {
        this.reloadUsers();
        this.showSuccess('User deleted successfully!');
      },
      error: (err) => console.error('Delete failed:', err),
    });
  }

  // ── step 8: filter / helper methods ──────────────────────────
  setTab(tab: string): void {
    this.selectedTab.set(tab);
  }

  getFilteredUsers(users: UserType[]): UserType[] {
    const tab = this.selectedTab();
    switch (tab) {
      case 'Active':
        return users.filter((u) => u.status === 'Active');
      case 'Inactive':
        return users.filter((u) => u.status === 'Inactive');
      case 'Suspended':
        return users.filter((u) => u.status === 'Suspended');
      default:
        return users;
    }
  }

  getRolesLabels(userRoles: RoleType[]): string {
    if (!userRoles || userRoles.length === 0) return 'No Role';
    return userRoles.map((r) => r.name).join(', ');
  }

  getActiveUser(users: UserType[]): UserType[] {
    return users.filter((u) => u.status === 'Active');
  }

  getSuspendedUser(users: UserType[]): UserType[] {
    return users.filter((u) => u.status === 'Suspended');
  }

  getStatusUser(users: UserType[], status: string): UserType[] {
    return users.filter((u) => u.status === status);
  }
}
