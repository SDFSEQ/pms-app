import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, LogoComponent],
  template: `
    <div class="login-page">

      <!-- Left panel — branding -->
      <div class="login-brand">
        <app-logo orientation="vertical" [iconSize]="72" class="light" />
        <p class="brand-tagline">Manage your workforce and projects with clarity</p>
        <div class="brand-badges">
          <span class="badge"><i class="pi pi-users"></i> Employee Tracking</span>
          <span class="badge"><i class="pi pi-briefcase"></i> Project Allocation</span>
          <span class="badge"><i class="pi pi-chart-bar"></i> Live Dashboard</span>
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="login-card">
        <div class="login-card-header">
          <app-logo orientation="horizontal" [iconSize]="40" class="light" />
        </div>

        <h2>Welcome back</h2>
        <p class="login-sub">Sign in to continue to your dashboard</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label class="form-label">Username</label>
            <input pInputText formControlName="username" placeholder="Enter username" class="w-full" />
          </div>

          <div class="form-field">
            <label class="form-label">Password</label>
            <p-password formControlName="password" placeholder="Enter password"
                        [feedback]="false" [toggleMask]="true"
                        styleClass="w-full" inputStyleClass="w-full">
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
      background: #f8fafc;
    }

    /* ── Left branding panel ─────────────────────────── */
    .login-brand {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 3rem 4rem;
      background: linear-gradient(145deg, #003d24 0%, #005C35 50%, #006b3e 100%);
      position: relative;
      overflow: hidden;
    }
    .login-brand::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: rgba(201,160,40,0.08);
    }
    .login-brand::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -60px;
      width: 240px; height: 240px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    .brand-tagline {
      margin: 1.5rem 0 2rem;
      font-size: 1.05rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.6;
      max-width: 340px;
    }
    .brand-badges {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(201,160,40,0.3);
      border-radius: 8px;
      padding: 0.5rem 0.875rem;
      color: rgba(255,255,255,0.85);
      font-size: 0.85rem;
      font-weight: 500;
      width: fit-content;
    }
    .badge i { color: #C9A028; font-size: 0.9rem; }

    /* ── Right form card ─────────────────────────────── */
    .login-card {
      width: 420px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3rem;
      background: white;
      box-shadow: -8px 0 40px rgba(0,0,0,0.08);
    }
    .login-card-header {
      margin-bottom: 2.5rem;
    }
    h2 { margin: 0 0 0.25rem; font-size: 1.6rem; font-weight: 700; color: #1e293b; }
    .login-sub { margin: 0 0 2rem; color: #64748b; font-size: 0.9rem; }

    .login-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    /* ── Mobile: stack vertically ────────────────────── */
    @media (max-width: 768px) {
      .login-page { flex-direction: column; }
      .login-brand {
        flex: none;
        padding: 2.5rem 1.5rem;
        align-items: center;
        text-align: center;
      }
      .brand-tagline { text-align: center; }
      .brand-badges { align-items: center; }
      .login-card {
        width: 100%;
        padding: 2rem 1.5rem;
        box-shadow: none;
      }
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
