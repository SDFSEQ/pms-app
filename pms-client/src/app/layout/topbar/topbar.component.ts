import { Component, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [DatePipe, ButtonModule],
  template: `
    <div class="topbar">
      <div class="topbar-left">
        <button class="hamburger" (click)="menuToggle.emit()" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
        <span class="topbar-title">Project Management System</span>
      </div>
      <span class="topbar-date">{{ today | date:'EEE, MMM d' }}</span>
    </div>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 100%;
      background: var(--surface-0);
    }
    .topbar-left { display: flex; align-items: center; gap: 0.75rem; }
    .topbar-title { font-weight: 600; font-size: 1rem; color: var(--surface-700); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .topbar-date { font-size: 0.8rem; color: var(--surface-500); white-space: nowrap; }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--surface-600);
      border-radius: 2px;
    }
    .hamburger:hover { background: var(--surface-100); }

    @media (max-width: 1023px) {
      .hamburger { display: flex; }
    }
    @media (max-width: 480px) {
      .topbar { padding: 0 1rem; }
      .topbar-title { font-size: 0.9rem; }
      .topbar-date { display: none; }
    }
  `]
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  today = new Date();
}
