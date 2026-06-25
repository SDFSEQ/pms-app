import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="login-page">
      <div class="login-card">

        <div class="login-header">
          <div class="login-logo">
            <i class="pi pi-briefcase"></i>
          </div>
          <h1>Project Management</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label class="form-label">Username</label>
            <input pInputText formControlName="username" placeholder="Enter username" class="w-full" />
          </div>

          <div class="form-field">
            <label class="form-label">Password</label>
            <p-password formControlName="password" placeholder="Enter password"
                        [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full">
            </p-password>
          </div>

          @if (error) {
            <div class="login-error">
              <i class="pi pi-exclamation-triangle"></i> {{ error }}
            </div>
          }

          <p-button label="Sign In" type="submit" icon="pi pi-sign-in"
                    styleClass="w-full mt-2"
                    [disabled]="form.invalid || loading"
                    [loading]="loading">
          </p-button>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .login-logo {
      width: 64px; height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
      i { font-size: 1.75rem; color: white; }
    }
    .login-header h1 { margin: 0 0 0.25rem; font-size: 1.4rem; font-weight: 700; color: #1e293b; }
    .login-header p { margin: 0; color: #64748b; font-size: 0.9rem; }
    .login-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.form.value.username!, password: this.form.value.password! })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.loading = false;
          this.error = err.status === 401
            ? 'Invalid username or password.'
            : 'Login failed. Please try again.';
        }
      });
  }
}
