import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [value]="label" [severity]="severity"></p-tag>`
})
export class StatusBadgeComponent {
  @Input({ required: true }) value = '';

  get label() { return this.value; }

  get severity(): 'success' | 'info' | 'warning' | 'danger' | undefined {
    switch (this.value.toLowerCase()) {
      case 'available': return 'success';
      case 'unavailable': return 'warning';
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'on_hold':
      case 'onhold': return 'warning';
      default: return undefined;
    }
  }
}
