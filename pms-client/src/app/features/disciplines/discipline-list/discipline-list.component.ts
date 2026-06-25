import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DisciplineService } from '../../../core/services/discipline.service';
import { Discipline } from '../../../core/models/discipline.model';

@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <h2>Disciplines</h2>
      <p-button label="Add Discipline" icon="pi pi-plus" routerLink="new" />
    </div>

    <div class="table-wrapper">
    <p-table [value]="disciplines" [loading]="loading" styleClass="p-datatable-striped">
      <ng-template pTemplate="header">
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th style="width:120px">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-d>
        <tr>
          <td><strong>{{ d.name }}</strong></td>
          <td>{{ d.description || '—' }}</td>
          <td>
            <p-button icon="pi pi-pencil" severity="info" [text]="true" [routerLink]="[d.id, 'edit']" />
            <p-button icon="pi pi-trash" severity="danger" [text]="true" (click)="confirmDelete(d)" />
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="3" class="text-center">No disciplines found.</td></tr>
      </ng-template>
    </p-table>
    </div>
  `,
  styles: [`.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; } h2 { margin:0; }`]
})
export class DisciplineListComponent implements OnInit {
  private readonly disciplineService = inject(DisciplineService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  disciplines: Discipline[] = [];
  loading = true;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.disciplineService.getAll().subscribe({
      next: d => { this.disciplines = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(d: Discipline) {
    this.confirmationService.confirm({
      message: `Delete discipline "${d.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      accept: () => {
        this.disciplineService.delete(d.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${d.name}" removed.` }); this.load(); },
        });
      }
    });
  }
}
