import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  summary: DashboardSummary | null = null;
  loading = true;

  readonly palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  get maxOpen(): number {
    return Math.max(...(this.summary?.openPositionsByDiscipline.map(d => d.count) ?? [1]), 1);
  }

  get maxAvail(): number {
    return Math.max(...(this.summary?.availableEmployeesByDiscipline.map(d => d.count) ?? [1]), 1);
  }

  pct(count: number, max: number): number {
    return Math.round((count / max) * 100);
  }

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: data => { this.summary = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
