import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PanelMenuModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-text">PMS</span>
        <span class="logo-sub">Project Manager</span>
      </div>
      <nav class="sidebar-nav">
        @for (item of menuItems; track item.label) {
          <a [routerLink]="item.routerLink" routerLinkActive="active" class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
        <div class="nav-divider"></div>
        @for (item of assignItems; track item.label) {
          <a [routerLink]="item.routerLink" routerLinkActive="active" class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    .sidebar { display:flex; flex-direction:column; height:100%; background:var(--surface-900); color:var(--surface-0); }
    .sidebar-logo { padding:1.5rem 1rem; border-bottom:1px solid var(--surface-700); }
    .logo-text { display:block; font-size:1.5rem; font-weight:700; color:var(--primary-400); }
    .logo-sub { font-size:0.75rem; color:var(--surface-400); }
    .sidebar-nav { padding:1rem 0; flex:1; }
    .nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1.25rem; color:var(--surface-200); text-decoration:none; border-radius:0; transition:background 0.2s; cursor:pointer; }
    .nav-item:hover { background:var(--surface-700); }
    .nav-item.active { background:var(--primary-900); color:var(--primary-300); border-left:3px solid var(--primary-400); }
    .nav-item i { font-size:1.1rem; width:1.25rem; }
    .nav-divider { margin:0.75rem 1rem; border-top:1px solid var(--surface-700); }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard',    icon: 'pi pi-home',     routerLink: ['/dashboard'] },
    { label: 'Employees',    icon: 'pi pi-users',    routerLink: ['/employees'] },
    { label: 'Projects',     icon: 'pi pi-briefcase',routerLink: ['/projects'] },
    { label: 'Disciplines',  icon: 'pi pi-tags',     routerLink: ['/disciplines'] },
  ];

  assignItems: MenuItem[] = [
    { label: 'Assign by Project',  icon: 'pi pi-sitemap', routerLink: ['/assignments/by-project'] },
    { label: 'Assign by Employee', icon: 'pi pi-user-plus',routerLink: ['/assignments/by-employee'] },
  ];
}
