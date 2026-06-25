import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { EmployeeService } from '../../../core/services/employee.service';
import { DisciplineService } from '../../../core/services/discipline.service';
import { Employee } from '../../../core/models/employee.model';
import { Discipline } from '../../../core/models/discipline.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    RouterLink, CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    InputTextModule, ConfirmDialogModule, ToastModule, DropdownModule, StatusBadgeComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly disciplineService = inject(DisciplineService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  employees: Employee[] = [];
  disciplines: Discipline[] = [];
  loading = true;
  filterStatus = '';
  filterDisciplineId: number | null = null;

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'Available' },
    { label: 'Unavailable', value: 'Unavailable' }
  ];

  ngOnInit() {
    this.disciplineService.getAll().subscribe(d => this.disciplines = d);
    this.load();
  }

  load() {
    this.loading = true;
    this.employeeService.getAll(this.filterStatus || undefined, this.filterDisciplineId ?? undefined).subscribe({
      next: e => { this.employees = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(e: Employee) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${e.firstName} ${e.lastName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.employeeService.delete(e.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${e.firstName} ${e.lastName} has been removed.` });
            this.load();
          },
          error: (err) => {
            const detail = err.error?.detail ?? 'This employee cannot be deleted.';
            this.messageService.add({ severity: 'error', summary: 'Cannot Delete', detail, life: 8000, sticky: false });
          }
        });
      }
    });
  }
}
