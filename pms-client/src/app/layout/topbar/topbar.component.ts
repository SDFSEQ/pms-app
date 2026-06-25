import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="topbar">
      <span class="topbar-title">Project Management System</span>
      <span class="topbar-date">{{ today | date:'EEEE, MMMM d, y' }}</span>
    </div>
  `,
  styles: [`
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; height:100%; background:var(--surface-0); border-bottom:1px solid var(--surface-200); }
    .topbar-title { font-weight:600; font-size:1.1rem; color:var(--surface-700); }
    .topbar-date { font-size:0.85rem; color:var(--surface-500); }
  `]
})
export class TopbarComponent {
  today = new Date();
}
