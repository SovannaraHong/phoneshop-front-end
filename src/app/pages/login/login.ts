import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../core/services/login/login-service';
import { LoginType } from '../../core/models/user.model';
import { Auth } from '../../core/services/auth/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(Auth);

  @Input() onLoginSuccess!: () => void;
  loginForm!: FormGroup;

  errorUsername = '';
  errorPassword = '';
  isLoading = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [''],
      password: [''],
    });

    // Clear username error only when username field changes
    this.loginForm.get('username')?.valueChanges.subscribe(() => {
      this.errorUsername = '';
    });

    // Clear password error only when password field changes
    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.errorPassword = '';
    });
  }

  onSubmit() {
    if (this.isLoading) return;

    this.errorUsername = '';
    this.errorPassword = '';
    this.isLoading = true;

    const data = this.loginForm.value as LoginType;

    this.loginService.login(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.auth.setToken(res.data.accessToken);
        this.auth.setUser(res);
        this.onLoginSuccess?.();
      },
      error: (err) => {
        this.isLoading = false;
        const message: string = err.error?.message ?? 'Something went wrong';
        const field: string = err.error?.field ?? 'username';

        // Show error on specific field
        if (field === 'password') {
          this.errorPassword = message;
        } else {
          this.errorUsername = message;
        }
        this.cdr.detectChanges();
      },
    });
  }
}
