import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user/user-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleType, UserType } from '../../core/models/user.model';
import { UserForm } from '../../content/user-form/user-form';
import { RoleForm } from '../../content/role-form/role-form'; // ✅ import RoleForm
import { listAnimation, statAnimation, toastAnimation } from '../../shared/pipes/animation';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, UserForm, RoleForm, RouterLink, RouterLinkActive], // ✅ add RoleForm here
  standalone: true,
  templateUrl: './user.html',
  styleUrl: './user.css',
  animations: [listAnimation, statAnimation, toastAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User implements OnInit {
  @ViewChild('userForm') userForm!: UserForm;
  // ── step 1: inject ────────────────────────────────────────────
  private userService = inject(UserService);

  // ── step 2: refresh trigger ───────────────────────────────────
  private refresh$ = new BehaviorSubject<void>(undefined);
  isDelete = signal(false);
  deleteTargetId = signal<number | null>(null);

  // ── step 3: HTTP → Signal ─────────────────────────────────────
  userList = toSignal(this.refresh$.pipe(switchMap(() => this.userService.getUser())), {
    initialValue: [] as UserType[],
  });

  // ── step 4: UI state signals ──────────────────────────────────
  selectedTab = signal<string>('All');
  searchQuery = signal<string>('');
  selectedUser = signal<UserType | null>(null);
  isOpenForm = signal(false);
  isOpenRoleForm = signal(false); // ✅ role modal signal
  showToast = signal(false);
  toastMessage = signal('');

  readonly tabs = ['All', 'Active', 'Inactive', 'Suspended'];

  // ── step 5: computed — filter by tab + search ─────────────────
  filteredUsers = computed(() => {
    const users = this.userList();
    const tab = this.selectedTab();
    const query = this.searchQuery().toLowerCase().trim();

    let result = users;
    if (tab === 'Active') result = users.filter((u) => u.status === 'Active');
    if (tab === 'Inactive') result = users.filter((u) => u.status === 'Inactive');
    if (tab === 'Suspended') result = users.filter((u) => u.status === 'Suspended');

    if (!query) return result;

    return result.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const username = u.username?.toLowerCase() ?? '';
      const roles = u.roles?.map((r) => r.name.toLowerCase()).join(' ') ?? '';
      return fullName.includes(query) || username.includes(query) || roles.includes(query);
    });
  });

  // ── step 6: computed stats ────────────────────────────────────
  totalUsers = computed(() => this.userList().length);
  activeUsers = computed(() => this.userList().filter((u) => u.status === 'Active').length);
  inactiveUsers = computed(() => this.userList().filter((u) => u.status === 'Inactive').length);
  suspendedUsers = computed(() => this.userList().filter((u) => u.status === 'Suspended').length);

  getPercent(count: number) {
    if (this.totalUsers() === 0) return;
    return ((count / this.totalUsers()) * 100).toFixed(1) + '%';
  }
  inUp(count: number): boolean {
    return count > 0;
  }

  // ── step 7: lifecycle ─────────────────────────────────────────
  ngOnInit(): void {}

  // ── step 8: toast ─────────────────────────────────────────────
  private showSuccess(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 4000);
  }

  // ── step 9: user form open/close ──────────────────────────────
  openFormCreate(): void {
    this.selectedUser.set(null);
    this.isOpenForm.set(true);
  }

  openFormEdit(user: UserType): void {
    this.selectedUser.set(user);
    this.isOpenForm.set(true);
  }

  toggleForm(): void {
    this.isOpenForm.set(!this.isOpenForm());
    if (!this.isOpenForm()) {
      this.selectedUser.set(null);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.toggleForm();
    }
  }

  // ── step 10: after user form saves ───────────────────────────
  onUserCreated(): void {
    const isEdit = !!this.selectedUser();
    this.refresh$.next();
    this.toggleForm();
    this.showSuccess(isEdit ? 'User updated successfully!' : 'User created successfully!');
  }

  // ── step 11: after role form saves ───────────────────────────

  onRoleCreated(): void {
    this.isOpenRoleForm.set(false);
    this.userForm?.triggerRefresh();
    this.showSuccess('Role created successfully!');
  }

  // ── step 12: delete ───────────────────────────────────────────
  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.isDelete.set(true);
  }

  onConfirmDelete() {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.refresh$.next();
        this.showSuccess('User deleted successfully!');
        this.isDelete.set(false);
        this.deleteTargetId.set(null);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.isDelete.set(false);
      },
    });
  }

  onCancelDelete() {
    this.isDelete.set(false);
    this.deleteTargetId.set(null);
  }

  // ── step 13: helpers ──────────────────────────────────────────
  setTab(tab: string): void {
    this.selectedTab.set(tab);
    this.searchQuery.set('');
  }

  getRolesLabels(roles: RoleType[]): string {
    if (!roles || roles.length === 0) return 'No Role';
    return roles.map((r) => r.name).join(', ');
  }
}
