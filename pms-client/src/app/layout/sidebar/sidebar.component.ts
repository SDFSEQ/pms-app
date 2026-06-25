import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, ButtonModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-content">
          <span class="logo-text">PMS</span>
          <span class="logo-sub">Project Manager</span>
        </div>
        <button class="sidebar-close" (click)="closeRequest.emit()" aria-label="Close menu">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        @for (item of menuItems; track item.label) {
          <a [routerLink]="item.routerLink" routerLinkActive="active" class="nav-item"
             (click)="closeRequest.emit()">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
        <div class="nav-divider"></div>
        @for (item of assignItems; track item.label) {
          <a [routerLink]="item.routerLink" routerLinkActive="active" class="nav-item"
             (click)="closeRequest.emit()">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
        @if (auth.isAdmin()) {
          <div class="nav-divider"></div>
          <a routerLink="/users" routerLinkActive="active" class="nav-item"
             (click)="closeRequest.emit()">
            <i class="pi pi-shield"></i>
            <span>User Management</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ initial }}</div>
          <div class="user-details">
            <span class="user-name">{{ auth.getUsername() }}</span>
            <span class="user-role">{{ auth.getRole() }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()" title="Sign out">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar { display:flex; flex-direction:column; height:100%; background:var(--surface-900); color:var(--surface-0); }
    .sidebar-logo { padding:1.25rem 1rem; border-bottom:1px solid var(--surface-700); display:flex; align-items:center; justify-content:space-between; }
    .logo-content { display:flex; flex-direction:column; }
    .sidebar-close { display:none; background:none; border:none; color:var(--surface-400); cursor:pointer; padding:0.3rem; border-radius:6px; }
    .sidebar-close:hover { color:var(--surface-100); background:var(--surface-700); }
    .sidebar-close i { font-size:1rem; }
    @media (max-width: 1023px) { .sidebar-close { display:flex; align-items:center; justify-content:center; } }
    .logo-text { display:block; font-size:1.5rem; font-weight:700; color:var(--primary-400); }
    .logo-sub { font-size:0.75rem; color:var(--surface-400); }
    .sidebar-nav { padding:1rem 0; flex:1; overflow-y:auto; }
    .nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1.25rem; color:var(--surface-200); text-decoration:none; transition:background 0.2s; cursor:pointer; }
    .nav-item:hover { background:var(--surface-700); }
    .nav-item.active { background:var(--primary-900); color:var(--primary-300); border-left:3px solid var(--primary-400); }
    .nav-item i { font-size:1.1rem; width:1.25rem; }
    .nav-divider { margin:0.75rem 1rem; border-top:1px solid var(--surface-700); }

    .sidebar-footer { padding:1rem; border-top:1px solid var(--surface-700); display:flex; align-items:center; gap:0.75rem; }
    .user-info { display:flex; align-items:center; gap:0.6rem; flex:1; min-width:0; }
    .user-avatar { width:34px; height:34px; border-radius:50%; background:var(--primary-600); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; color:white; flex-shrink:0; }
    .user-details { display:flex; flex-direction:column; min-width:0; }
    .user-name { font-size:0.85rem; font-weight:600; color:var(--surface-100); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-role { font-size:0.72rem; color:var(--surface-400); }
    .logout-btn { background:none; border:none; color:var(--surface-400); cursor:pointer; padding:0.4rem; border-radius:6px; display:flex; align-items:center; transition:color 0.2s, background 0.2s; }
    .logout-btn:hover { color:var(--red-400); background:var(--surface-800); }
    .logout-btn i { font-size:1.1rem; }
  `]
})
export class SidebarComponent {
  @Output() closeRequest = new EventEmitter<void>();
  readonly auth = inject(AuthService);

  get initial(): string {
    return (this.auth.getUsername() ?? 'U')[0].toUpperCase();
  }

  menuItems: MenuItem[] = [
    { label: 'Dashboard',   icon: 'pi pi-home',      routerLink: ['/dashboard'] },
    { label: 'Employees',   icon: 'pi pi-users',     routerLink: ['/employees'] },
    { label: 'Projects',    icon: 'pi pi-briefcase', routerLink: ['/projects'] },
    { label: 'Disciplines', icon: 'pi pi-tags',      routerLink: ['/disciplines'] },
  ];

  assignItems: MenuItem[] = [
    { label: 'Assign by Project',   icon: 'pi pi-sitemap',   routerLink: ['/assignments/by-project'] },
    { label: 'Assign by Employee',  icon: 'pi pi-user-plus', routerLink: ['/assignments/by-employee'] },
  ];
}
