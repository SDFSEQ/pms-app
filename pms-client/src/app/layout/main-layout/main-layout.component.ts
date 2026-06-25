import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-shell">
      <aside class="app-sidebar">
        <app-sidebar />
      </aside>
      <div class="app-main">
        <header class="app-topbar">
          <app-topbar />
        </header>
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell { display:grid; grid-template-columns:240px 1fr; height:100vh; overflow:hidden; }
    .app-sidebar { overflow-y:auto; }
    .app-main { display:grid; grid-template-rows:56px 1fr; overflow:hidden; }
    .app-topbar { border-bottom:1px solid var(--surface-200); }
    .app-content { overflow-y:auto; padding:1.5rem; background:var(--surface-50); }
  `]
})
export class MainLayoutComponent {}
