import { Component, inject, signal } from '@angular/core';
import { RoleService } from '../../core/services/role/role-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleType } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RoleForm } from '../../content/role-form/role-form';
import { sign } from 'chart.js/helpers';

@Component({
  selector: 'app-role',
  imports: [CommonModule, RoleForm],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role {
  private roleService = inject(RoleService);
  private rout = inject(Router);
  isOpenForm = signal(false);
  isDelete = signal(false);

  selectedRole = signal<RoleType | null>(null);
  deleteTargetId = signal<number | null>(null);
  showToast = signal(false);
  toastMessage = signal('');

  private refresh$ = new BehaviorSubject<void>(undefined);

  roleList = toSignal(this.refresh$.pipe(switchMap(() => this.roleService.getRoles())), {
    initialValue: [] as RoleType[],
  });

  triggerRefresh() {
    this.refresh$.next();
  }

  private showSuccess(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 4000);
  }
  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.isDelete.set(true);
  }

  onConfirmDelete() {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.refresh$.next();
        this.deleteTargetId.set(null);
        this.isDelete.set(false);
        this.showSuccess('User deleted successfully!');
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
  onOpenForm() {
    this.isOpenForm.set(true);
    this.selectedRole.set(null);
  }
  onOpenEditForm(role: RoleType) {
    this.selectedRole.set(role);
    this.isOpenForm.set(true);
  }

  closeForm() {
    this.triggerRefresh();
    this.isOpenForm.set(false);
  }

  getRout() {
    this.rout.navigate(['/user']);
  }
  getColor(name: string): string {
    const first = name.charAt(0).toLowerCase();

    if (first === 'a') return ' bg-[#8c4cf3]';
    if (first === 's') return 'bg-gradient-to-br from-emerald-400 to-green-600';
    if (first === 'e') return 'bg-gradient-to-br from-yellow-400 to-orange-500';
    if (first === 'c') return 'bg-gradient-to-br from-red-400 to-pink-500';

    return 'bg-gradient-to-br from-pink-400 to-gray-600'; // default
  }
  getPermissionColor(name: string): string {
    if (name.includes('brand')) {
      return 'bg-gradient-to-br from-white-500 to-[#8c4cf3]';
    }

    if (name.includes('role')) {
      return 'bg-gradient-to-br from-red-400 to-gray-400';
    }

    if (name.includes('product')) {
      return 'bg-gradient-to-br from-pink-400 to-white-400';
    }
    if (name.includes('sale')) {
      return 'bg-gradient-to-br from-green-300 to-green-600';
    }

    return 'bg-gradient-to-br from-green-400 to-indigo-500'; // default
  }
}
