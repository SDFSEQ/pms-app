import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, CommonModule, TableModule, ButtonModule, TagModule, BadgeModule, ConfirmDialogModule, ToastModule, StatusBadgeComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  projects: Project[] = [];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: p => { this.projects = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(p: Project) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${p.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.projectService.delete(p.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${p.name}" has been removed.` });
            this.load();
          },
          error: (err) => {
            const detail = err.error?.detail ?? 'This project cannot be deleted.';
            this.messageService.add({ severity: 'error', summary: 'Cannot Delete', detail, life: 8000, sticky: false });
          }
        });
      }
    });
  }

  openBadge(count: number): 'success' | 'warn' | 'danger' {
    return count === 0 ? 'success' : count > 3 ? 'danger' : 'warn';
  }
}
