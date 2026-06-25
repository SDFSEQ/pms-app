import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeeService } from '../../../core/services/employee.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { Employee } from '../../../core/models/employee.model';
import { EligibleProject } from '../../../core/models/assignment.model';

@Component({
  selector: 'app-assign-by-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, CalendarModule, ToastModule, TagModule, CardModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './assign-by-employee.component.html'
})
export class AssignByEmployeeComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly messageService = inject(MessageService);

  employees: Employee[] = [];
  loading = true;

  selectedEmployee: Employee | null = null;
  eligibleProjects: EligibleProject[] = [];
  loadingProjects = false;

  selectedProject: EligibleProject | null = null;
  showDateDialog = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  saving = false;

  ngOnInit() {
    this.employeeService.getAll('Available').subscribe({
      next: e => { this.employees = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  selectEmployee(e: Employee) {
    this.selectedEmployee = e;
    this.eligibleProjects = [];
    this.loadingProjects = true;

    this.assignmentService.getEligibleProjects(e.id).subscribe({
      next: p => { this.eligibleProjects = p; this.loadingProjects = false; },
      error: () => { this.loadingProjects = false; }
    });
  }

  openAssignDialog(proj: EligibleProject) {
    this.selectedProject = proj;
    this.startDate = null;
    this.endDate = null;
    this.showDateDialog = true;
  }

  toDateOnly(d: Date | null): string {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  confirmAssignment() {
    if (!this.selectedEmployee || !this.selectedProject || !this.startDate || !this.endDate) return;
    this.saving = true;

    this.assignmentService.create({
      employeeId: this.selectedEmployee.id,
      projectDisciplineId: this.selectedProject.projectDisciplineId,
      startDate: this.toDateOnly(this.startDate),
      endDate: this.toDateOnly(this.endDate)
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `${this.selectedEmployee?.firstName} assigned to ${this.selectedProject?.projectName}.` });
        this.showDateDialog = false;
        this.saving = false;
        this.employees = this.employees.filter(e => e.id !== this.selectedEmployee?.id);
        this.selectedEmployee = null;
        this.eligibleProjects = [];
      },
      error: () => { this.saving = false; }
    });
  }
}
