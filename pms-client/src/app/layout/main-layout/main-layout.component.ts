import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-shell" [class.sidebar-open]="sidebarOpen">

      <!-- Overlay for mobile -->
      <div class="sidebar-overlay" (click)="closeSidebar()"></div>

      <aside class="app-sidebar">
        <app-sidebar (closeRequest)="closeSidebar()" />
      </aside>

      <div class="app-main">
        <header class="app-topbar">
          <app-topbar (menuToggle)="toggleSidebar()" />
        </header>
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      height: 100vh;
      overflow: hidden;
    }
    .app-sidebar { overflow-y: auto; z-index: 1001; }
    .app-main { display: grid; grid-template-rows: 56px 1fr; overflow: hidden; min-width: 0; }
    .app-topbar { border-bottom: 1px solid var(--surface-200); }
    .app-content { overflow-y: auto; padding: 1.5rem; background: var(--surface-50); }
    .sidebar-overlay { display: none; }

    @media (max-width: 1023px) {
      .app-shell { grid-template-columns: 1fr; }

      .app-sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        width: 240px;
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        box-shadow: none;
      }

      .app-shell.sidebar-open .app-sidebar {
        transform: translateX(0);
        box-shadow: 4px 0 24px rgba(0,0,0,0.25);
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0);
        z-index: 1000;
        pointer-events: none;
        transition: background 0.28s;
      }

      .app-shell.sidebar-open .sidebar-overlay {
        background: rgba(0,0,0,0.45);
        pointer-events: all;
      }
    }

    @media (max-width: 640px) {
      .app-content { padding: 1rem; }
    }
  `]
})
export class MainLayoutComponent {
  sidebarOpen = false;

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) this.sidebarOpen = false;
  }
}
