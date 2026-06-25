import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TableModule, TagModule, ProgressBarModule, ProgressSpinnerModule, StatusBadgeComponent],
  template: `
    @if (loading) {
      <p-progressSpinner />
    } @else if (project) {
      <div class="flex align-items-center gap-3 mb-3">
        <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" routerLink="/projects" />
        <h2 style="margin:0">{{ project.name }}</h2>
        <app-status-badge [value]="project.status" />
        <p-button icon="pi pi-pencil" label="Edit" severity="info" [outlined]="true" [routerLink]="['..', project.id, 'edit']" class="ml-auto" />
      </div>

      <div class="grid">
        <div class="col-12 md:col-4">
          <p-card header="Project Details">
            <div class="detail-row"><span class="label">Start</span>{{ project.startDate || '—' }}</div>
            <div class="detail-row"><span class="label">End</span>{{ project.endDate || '—' }}</div>
            <div class="detail-row"><span class="label">Status</span><app-status-badge [value]="project.status" /></div>
            <div class="detail-row"><span class="label">Required</span>{{ project.totalRequired }}</div>
            <div class="detail-row"><span class="label">Filled</span>{{ project.totalFilled }}</div>
            <div class="detail-row"><span class="label">Open</span><strong class="text-orange-600">{{ project.totalOpen }}</strong></div>
          </p-card>
        </div>

        <div class="col-12 md:col-8">
          <p-card header="Discipline Requirements">
            <p-table [value]="project.disciplineRequirements">
              <ng-template pTemplate="header">
                <tr><th>Discipline</th><th>Required</th><th>Filled</th><th>Open</th><th>Progress</th></tr>
              </ng-template>
              <ng-template pTemplate="body" let-dr>
                <tr>
                  <td>{{ dr.disciplineName }}</td>
                  <td>{{ dr.requiredCount }}</td>
                  <td>{{ dr.filledCount }}</td>
                  <td [class.text-orange-600]="dr.openCount > 0" [class.text-green-600]="dr.openCount === 0">
                    <strong>{{ dr.openCount }}</strong>
                  </td>
                  <td style="min-width:120px">
                    <p-progressBar [value]="progress(dr)" [showValue]="false"
                                   [styleClass]="dr.openCount === 0 ? 'filled-bar' : ''" />
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>
    }
  `,
  styles: [`.detail-row{display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--surface-100);} .label{font-weight:600;color:var(--surface-600);}`]
})
export class ProjectDetailComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  project: Project | null = null;
  loading = true;

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.projectService.getById(id).subscribe({
      next: p => { this.project = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  progress(dr: { filledCount: number; requiredCount: number }): number {
    return Math.round((dr.filledCount / dr.requiredCount) * 100);
  }
}
