import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProjectService } from '../../../core/services/project.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { Project, ProjectDisciplineRequirement } from '../../../core/models/project.model';
import { EligibleEmployee } from '../../../core/models/assignment.model';

@Component({
  selector: 'app-assign-by-project',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, DropdownModule, CalendarModule, ToastModule, TagModule, CardModule],
  providers: [MessageService],
  templateUrl: './assign-by-project.component.html'
})
export class AssignByProjectComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly messageService = inject(MessageService);

  projects: Project[] = [];
  loading = true;

  selectedProject: Project | null = null;
  openSlots: ProjectDisciplineRequirement[] = [];

  selectedSlot: ProjectDisciplineRequirement | null = null;
  eligibleEmployees: EligibleEmployee[] = [];
  loadingEmployees = false;
  showEmployeeDialog = false;

  selectedEmployee: EligibleEmployee | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  saving = false;

  ngOnInit() {
    this.projectService.getAll(undefined, true).subscribe({
      next: p => { this.projects = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  selectProject(p: Project) {
    this.selectedProject = p;
    this.openSlots = p.disciplineRequirements.filter(r => r.openCount > 0);
  }

  selectSlot(slot: ProjectDisciplineRequirement) {
    this.selectedSlot = slot;
    this.selectedEmployee = null;
    this.startDate = null;
    this.endDate = null;
    this.loadingEmployees = true;
    this.showEmployeeDialog = true;

    this.assignmentService.getEligibleEmployees(slot.id).subscribe({
      next: e => { this.eligibleEmployees = e; this.loadingEmployees = false; },
      error: () => { this.loadingEmployees = false; }
    });
  }

  toDateOnly(d: Date | null): string {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  confirmAssignment() {
    if (!this.selectedEmployee || !this.selectedSlot || !this.startDate || !this.endDate) return;
    this.saving = true;

    this.assignmentService.create({
      employeeId: this.selectedEmployee.employeeId,
      projectDisciplineId: this.selectedSlot.id,
      startDate: this.toDateOnly(this.startDate),
      endDate: this.toDateOnly(this.endDate)
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `${this.selectedEmployee?.firstName} assigned successfully.` });
        this.showEmployeeDialog = false;
        this.saving = false;
        this.refreshProjects();
      },
      error: () => { this.saving = false; }
    });
  }

  private refreshProjects() {
    this.projectService.getAll(undefined, true).subscribe(p => {
      this.projects = p;
      if (this.selectedProject) {
        this.selectedProject = p.find(x => x.id === this.selectedProject!.id) ?? null;
        if (this.selectedProject) this.openSlots = this.selectedProject.disciplineRequirements.filter(r => r.openCount > 0);
      }
    });
  }
}
