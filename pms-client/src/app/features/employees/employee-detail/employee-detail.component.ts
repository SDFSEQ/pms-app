import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TableModule, ProgressSpinnerModule, StatusBadgeComponent],
  template: `
    @if (loading) {
      <p-progressSpinner />
    } @else if (employee) {
      <div class="flex align-items-center gap-3 mb-3">
        <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" routerLink="/employees" />
        <h2 style="margin:0">{{ employee.firstName }} {{ employee.lastName }}</h2>
        <app-status-badge [value]="employee.status" />
        <p-button icon="pi pi-pencil" label="Edit" severity="info" [outlined]="true" [routerLink]="['..', employee.id, 'edit']" class="ml-auto" />
      </div>

      <div class="grid">
        <div class="col-12 md:col-4">
          <p-card header="Details">
            <div class="detail-row"><span class="label">Email</span><span>{{ employee.email }}</span></div>
            <div class="detail-row"><span class="label">Phone</span><span>{{ employee.phone || '—' }}</span></div>
            <div class="detail-row">
              <span class="label">Disciplines</span>
              <div>
                @for (d of employee.disciplines; track d.id) {
                  <p-tag [value]="d.name" severity="secondary" styleClass="mr-1 mb-1" />
                }
              </div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-8">
          <p-card header="Assignment History">
            <p-table [value]="employee.assignments ?? []">
              <ng-template pTemplate="header">
                <tr>
                  <th>Project</th>
                  <th>Discipline</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-a>
                <tr>
                  <td>{{ a.projectName }}</td>
                  <td>{{ a.disciplineName }}</td>
                  <td>{{ a.startDate }}</td>
                  <td>{{ a.endDate }}</td>
                  <td>{{ a.durationDays }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="5" class="text-center">No assignments yet.</td></tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>
    }
  `,
  styles: [`.detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:0.5rem 0; border-bottom:1px solid var(--surface-100); gap:1rem; } .label { font-weight:600; color:var(--surface-600); min-width:90px; }`]
})
export class EmployeeDetailComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);

  employee: Employee | null = null;
  loading = true;

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employeeService.getById(id).subscribe({
      next: e => { this.employee = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
