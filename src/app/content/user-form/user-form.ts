import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../core/services/role/role-service';
import { tap } from 'rxjs';
import { RoleType, UserType } from '../../core/models/user.model';
import { UserService } from '../../core/services/user/user-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-form.html',
  standalone: true,
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private userService = inject(UserService);

  userCreated = output<void>();

  isLoading = signal(false);
  isSuccess = signal(false);
  userForm!: FormGroup;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      username: [''],
      phone: [''],
      password: [''],
      confirmPassword: [''],
      pob: [''],
      status: ['Inactive'],
      roles: this.fb.array([]),
    });
  }

  roleList = toSignal(
    this.roleService.getRoles().pipe(
      tap((role) => {
        this.roleArrays?.clear();
        role.forEach(() => this.roleArrays.push(this.fb.control(false)));
      }),
    ),
    { initialValue: [] as RoleType[] },
  );

  private getSelectedRole(): number[] {
    return (this.roleList() ?? []).filter((_, i) => this.roleArrays.at(i).value).map((i) => i.id);
  }

  get roleArrays() {
    return this.userForm.get('roles') as FormArray;
  }
  onSubmit() {
    if (this.userForm.invalid) return;
    this.isLoading.set(true);
    const { confirmPassword, roles, ...rest } = this.userForm.value;
    const payload = { ...rest, rolesId: this.getSelectedRole() };
    this.userService.createUser(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.onReset();
        this.userCreated.emit();
        setTimeout(() => this.isSuccess.set(false), 5000);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error:', err.error);
      },
    });
  }
  onReset() {
    this.userForm.reset({ status: 'Inactive' });
  }
}
