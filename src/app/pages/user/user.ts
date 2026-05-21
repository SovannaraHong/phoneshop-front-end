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
import { RoleType, UserType, PageDTO } from '../../core/models/user.model';
import { UserForm } from '../../content/user-form/user-form';
import { RoleForm } from '../../content/role-form/role-form';
import { listAnimation, statAnimation, toastAnimation } from '../../shared/pipes/animation';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, UserForm, RoleForm, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './user.html',
  styleUrl: './user.css',
  animations: [listAnimation, statAnimation, toastAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User implements OnInit {
  @ViewChild('userForm') userForm!: UserForm;

  private userService = inject(UserService);

  // ── pagination state ──────────────────────────────────────────
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // ── refresh trigger ───────────────────────────────────────────
  private refresh$ = new BehaviorSubject<{ page: number; size: number }>({
    page: 1,
    size: 10,
  });

  isDelete = signal(false);
  deleteTargetId = signal<number | null>(null);

  // ── HTTP → Signal ─────────────────────────────────────────────
  private pageData = toSignal(
    this.refresh$.pipe(switchMap(({ page, size }) => this.userService.getUser(page, size))),
    {
      initialValue: {
        list: [],
        paginationDTO: {
          empty: true,
          first: true,
          last: true,
          numberOfElements: 0,
          pageNumber: 1,
          pageSize: 10,
          totalElements: 0,
          totalPage: 0,
        },
      } as PageDTO<UserType>,
    },
  );

  // ── derive list + pagination meta ─────────────────────────────
  userList = computed(() => this.pageData().list ?? []);
  totalElements = computed(() => this.pageData().paginationDTO?.totalElements ?? 0);
  totalPages = computed(() => this.pageData().paginationDTO?.totalPage ?? 0);
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── UI state signals ──────────────────────────────────────────
  selectedTab = signal<string>('All');
  searchQuery = signal<string>('');
  selectedUser = signal<UserType | null>(null);
  isOpenForm = signal(false);
  isOpenRoleForm = signal(false);
  showToast = signal(false);
  toastMessage = signal('');

  readonly tabs = ['All', 'Active', 'Inactive', 'Suspended'];

  // ── filter by tab + search ────────────────────────────────────
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

  // ── stats ─────────────────────────────────────────────────────
  totalUsers = computed(() => this.totalElements());
  activeUsers = computed(() => this.userList().filter((u) => u.status === 'Active').length);
  inactiveUsers = computed(() => this.userList().filter((u) => u.status === 'Inactive').length);
  suspendedUsers = computed(() => this.userList().filter((u) => u.status === 'Suspended').length);

  getPercent(count: number) {
    if (this.totalElements() === 0) return '0%';
    return ((count / this.totalElements()) * 100).toFixed(1) + '%';
  }

  inUp(count: number): boolean {
    return count > 0;
  }

  ngOnInit(): void {}

  // ── refresh helper ────────────────────────────────────────────
  private triggerRefresh(): void {
    this.refresh$.next({
      page: this.currentPage(),
      size: this.pageSize(),
    });
  }

  // ── pagination actions ────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.triggerRefresh();
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // ── toast ─────────────────────────────────────────────────────
  private showSuccess(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 4000);
  }

  // ── form open/close ───────────────────────────────────────────
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
    if (!this.isOpenForm()) this.selectedUser.set(null);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.toggleForm();
  }

  // ── after saves ───────────────────────────────────────────────
  onUserCreated(): void {
    const isEdit = !!this.selectedUser();
    this.triggerRefresh();
    this.toggleForm();
    this.showSuccess(isEdit ? 'User updated successfully!' : 'User created successfully!');
  }

  onRoleCreated(): void {
    this.isOpenRoleForm.set(false);
    this.userForm?.triggerRefresh();
    this.showSuccess('Role created successfully!');
  }

  // ── delete ────────────────────────────────────────────────────
  confirmDelete(id: number): void {
    this.deleteTargetId.set(id);
    this.isDelete.set(true);
  }

  onConfirmDelete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.triggerRefresh();
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

  onCancelDelete(): void {
    this.isDelete.set(false);
    this.deleteTargetId.set(null);
  }

  // ── helpers ───────────────────────────────────────────────────
  setTab(tab: string): void {
    this.selectedTab.set(tab);
    this.searchQuery.set('');
  }

  getRolesLabels(roles: RoleType[]): string {
    if (!roles || roles.length === 0) return 'No Role';
    return roles.map((r) => r.name).join(', ');
  }
  onImageError(event: Event, user: UserType): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff&size=64&bold=true`;
  }
}
