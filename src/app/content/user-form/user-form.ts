import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject, // step 1 inject service
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../core/services/role/role-service';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
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
  // ── step 1: inject services ───────────────────────────────────
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private userService = inject(UserService);

  private refresh$ = new BehaviorSubject<void>(undefined);

  // ── step 2: inputs & outputs ──────────────────────────────────
  editUser = input<UserType | null>(null);
  userCreated = output<void>();
  openOtherRoles = output<void>();

  // ── step 3: state signals ─────────────────────────────────────
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(true);
  showCfPassword = signal(true);

  // ── step 4: form group ────────────────────────────────────────
  userForm!: FormGroup;

  triggerRefresh() {
    this.refresh$.next();
  }
  // ── step 5: getters ───────────────────────────────────────────
  get isEditMode(): boolean {
    return !!this.editUser();
  }

  get roleArrays(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  get getStatus() {
    return this.userForm.get('status');
  }

  // ── step 6: effect — patch form when editUser changes ─────────
  constructor() {
    effect(() => {
      const user = this.editUser();
      if (!this.userForm) return; // guard: form not ready yet

      if (user) {
        // patch all basic fields
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phoneNumber,
          pob: user.placeOfBirth,
          status: user.status,
        });

        // patch image preview
        if (user.imagePath) {
          this.previewUrl.set(user.imagePath);
        }

        // patch role checkboxes
        const roleList = this.roleList();
        if (roleList.length && user.roles) {
          roleList.forEach((role, i) => {
            const isSelected = user.roles.some((r: RoleType) => r.id === role.id);
            this.roleArrays.at(i).setValue(isSelected);
          });
        }
      } else {
        // clear form when switching to create mode
        this.onReset();
      }
    });
  }

  // ── step 7: init form ─────────────────────────────────────────
  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      phone: [''],
      password: [''],
      confirmPassword: [''],
      pob: [''],
      status: ['Inactive'],
      roles: this.fb.array([]),
    });

    // fallback patch in case effect fired before form was ready
    const user = this.editUser();
    if (user) {
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phoneNumber,
        pob: user.placeOfBirth,
        status: user.status,
      });
      if (user.imagePath) this.previewUrl.set(user.imagePath);
    }
  }

  // ── step 8: load roles and patch if editing ───────────────────
  roleList = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.roleService.getRoles()),
      tap((roles) => {
        this.roleArrays?.clear();

        roles.forEach(() => this.roleArrays.push(this.fb.control(false)));

        const user = this.editUser();
        if (user?.roles) {
          roles.forEach((role, i) => {
            const isSelected = user.roles.some((r: RoleType) => r.id === role.id);
            this.roleArrays.at(i).setValue(isSelected);
          });
        }
      }),
    ),
    { initialValue: [] as RoleType[] },
  );

  // ── step 9: get selected role ids for payload ─────────────────
  private getSelectedRole(): number[] {
    return (this.roleList() ?? []).filter((_, i) => this.roleArrays.at(i).value).map((r) => r.id);
  }

  // ── step 10: file select ──────────────────────────────────────
  onSelectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  onOpenOtherRoles(): void {
    this.openOtherRoles.emit();
  }

  // ── step 11: submit ───────────────────────────────────────────
  onSubmit(): void {
    if (this.userForm.invalid) return;
    this.isLoading.set(true);

    const { confirmPassword, roles, password, phone, pob, ...rest } = this.userForm.value;

    const payload: any = {
      ...rest,
      phoneNumber: phone,
      placeOfBirth: pob,
      rolesId: this.getSelectedRole(),
    };

    if (this.isEditMode) {
      if (password && password.trim().length > 0) {
        payload.password = password;
      }
      // ✅ if blank → don't include password in payload at all
      // backend will keep existing password untouched
      // ── update flow ───────────────────────────────────────────
      this.userService.updateUser(this.editUser()!.id, payload).subscribe({
        next: (res: any) => {
          const id = res?.data?.id ?? this.editUser()!.id;
          if (this.selectedFile()) {
            this.userService.uploadImg(id, this.selectedFile()!).subscribe({
              next: () => this.finish(),
              error: () => this.finish(),
            });
          } else {
            this.finish();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Update error:', err.error);
        },
      });
    } else {
      payload.password = password;
      // ── create flow ───────────────────────────────────────────
      this.userService.createUser(payload).subscribe({
        next: (res: any) => {
          const id = res.data.id;
          if (this.selectedFile()) {
            this.userService.uploadImg(id, this.selectedFile()!).subscribe({
              next: () => this.finish(),
              error: () => this.finish(),
            });
          } else {
            this.finish();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Create error:', err.error);
        },
      });
    }
  }

  // ── step 12: finish — emit to parent, parent handles toast ────
  private finish(): void {
    this.isLoading.set(false);
    this.selectedFile.set(null);
    this.onReset();
    this.previewUrl.set(null);
    this.userCreated.emit(); // parent (user.ts) handles toast + close
  }

  // ── step 13: reset form ───────────────────────────────────────
  onReset(): void {
    this.userForm.reset({ status: 'Active' });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }
  get username() {
    return this.userForm.get('username');
  }
  get firstName() {
    return this.userForm.get('firstName');
  }
  get lastName() {
    return this.userForm.get('lastName');
  }
  get password() {
    return this.userForm.get('password');
  }
  toggleHidePassword() {
    this.showPassword.set(!this.showPassword());
  }
  toggleHideCfPassword() {
    this.showCfPassword.set(!this.showCfPassword());
  }
}
