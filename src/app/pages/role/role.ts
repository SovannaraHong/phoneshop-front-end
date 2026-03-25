import { Component, inject, signal } from '@angular/core';
import { RoleService } from '../../core/services/role/role-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleType } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-role',
  imports: [CommonModule, RouterLink],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role {
  private roleService = inject(RoleService);
  private rout = inject(Router);

  private refresh$ = new BehaviorSubject<void>(undefined);

  roleList = toSignal(this.refresh$.pipe(switchMap(() => this.roleService.getRoles())), {
    initialValue: [] as RoleType[],
  });
  getRout() {
    this.rout.navigate(['/user']);
  }
  getColor(name: string): string {
    const first = name.charAt(0).toLowerCase();

    if (first === 'a') return ' bg-[#8c4cf3]';
    if (first === 's') return 'bg-gradient-to-br from-emerald-400 to-green-600';
    if (first === 'e') return 'bg-gradient-to-br from-yellow-400 to-orange-500';
    if (first === 'c') return 'bg-gradient-to-br from-red-400 to-pink-500';

    return 'bg-gradient-to-br from-purple-400 to-indigo-500'; // default
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
