import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../core/services/role/role-service';
import { RoleType } from '../../core/models/user.model';
const ALL_PERMISSIONS: { resource: string; items: { name: string }[] }[] = [
  {
    resource: 'brand',
    items: [{ name: 'brand:read' }, { name: 'brand:write' }],
  },
  {
    resource: 'user',
    items: [{ name: 'user:read' }, { name: 'user:write' }],
  },
  {
    resource: 'role',
    items: [{ name: 'role:read' }, { name: 'role:write' }],
  },
  {
    resource: 'product',
    items: [{ name: 'product:read' }, { name: 'product:write' }],
  },
  {
    resource: 'model',
    items: [{ name: 'model:read' }, { name: 'model:write' }],
  },
  {
    resource: 'sale',
    items: [{ name: 'sale:read' }, { name: 'sale:write' }],
  },
  {
    resource: 'color',
    items: [{ name: 'color:read' }, { name: 'color:write' }],
  },
  {
    resource: 'report',
    items: [{ name: 'report:read' }],
  },
  // 👉 Add more resource groups here as your backend grows
];
@Component({
  selector: 'app-role-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
})
export class RoleForm {
  // ── step 1: inject services ───────────────────────────────────
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);

  // ── step 2: inputs & outputs ──────────────────────────────────
  editRole = input<RoleType | null>(null);
  roleCreated = output<void>();

  // ── step 3: state ─────────────────────────────────────────────
  isLoading = signal(false);
  selectedPermissions: string[] = [];

  // ── step 4: static permission groups (for the template) ──────
  permissionGroups = ALL_PERMISSIONS;

  // ── step 5: form group ────────────────────────────────────────
  roleForm!: FormGroup;

  // ── step 6: getters ───────────────────────────────────────────
  get isEditMode(): boolean {
    return !!this.editRole();
  }

  get roleName() {
    return this.roleForm.get('name');
  }

  // ── step 7: effect — patch form when editRole changes ─────────
  constructor() {
    effect(() => {
      const role = this.editRole();
      if (!this.roleForm) return;

      if (role) {
        this.roleForm.patchValue({ name: role.name });
        // pre-select existing permissions
        this.selectedPermissions = role.permissions?.map((p) => p.name) ?? [];
      } else {
        this.onReset();
      }
    });
  }

  // ── step 8: init form ─────────────────────────────────────────
  ngOnInit(): void {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      // We manage permission state manually via selectedPermissions[]
      // This dummy control is just to keep the FormGroup valid/invalid tracking
      permissions: [null],
    });

    // fallback patch
    const role = this.editRole();
    if (role) {
      this.roleForm.patchValue({ name: role.name });
      this.selectedPermissions = role.permissions?.map((p) => p.name) ?? [];
    }
  }

  // ── step 9: permission helpers ────────────────────────────────
  isPermissionSelected(permName: string): boolean {
    return this.selectedPermissions.includes(permName);
  }

  onPermissionChange(permName: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedPermissions.includes(permName)) {
        this.selectedPermissions = [...this.selectedPermissions, permName];
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter((p) => p !== permName);
    }
  }

  /**
   * Returns the active chip style based on the permission action (read/write).
   * read  → cyan/sky
   * write → violet/indigo
   */
  getPermissionStyle(permName: string): string {
    if (permName.endsWith(':write')) {
      return 'border-violet-400 bg-violet-50 text-violet-600';
    }
    return 'border-cyan-400 bg-cyan-50 text-cyan-600';
  }

  // ── step 10: submit ───────────────────────────────────────────
  onSubmit(): void {
    if (this.roleForm.invalid || this.selectedPermissions.length === 0) return;
    this.isLoading.set(true);

    const payload = {
      name: this.roleForm.value.name,
      permissions: this.selectedPermissions,
    };

    if (this.isEditMode) {
      // 🛠️ Replace with updateRole() when available in RoleService
      this.roleService.createRoles(payload as any).subscribe({
        next: () => this.finish(),
        error: (err) => {
          this.isLoading.set(false);
          console.error('Update error:', err.error);
        },
      });
    } else {
      this.roleService.createRoles(payload as any).subscribe({
        next: () => this.finish(),
        error: (err) => {
          this.isLoading.set(false);
          console.error('Create error:', err.error);
        },
      });
    }
  }

  // ── step 11: finish ───────────────────────────────────────────
  private finish(): void {
    this.isLoading.set(false);
    this.onReset();
    this.roleCreated.emit(); // parent handles toast + close
  }

  // ── step 12: reset ────────────────────────────────────────────
  onReset(): void {
    this.roleForm?.reset();
    this.selectedPermissions = [];
  }
}
