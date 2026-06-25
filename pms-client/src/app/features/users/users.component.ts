import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { AppUser } from '../../core/models/auth.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
            InputTextModule, PasswordModule, DropdownModule, TagModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <h2>User Management</h2>
      <p-button label="Add User" icon="pi pi-plus" (click)="openDialog()" />
    </div>

    <div class="table-wrapper">
    <p-table [value]="users" [loading]="loading" styleClass="p-datatable-striped p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th>Username</th>
          <th>Role</th>
          <th>Created</th>
          <th style="width:100px">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-u>
        <tr>
          <td><strong>{{ u.username }}</strong></td>
          <td>
            <p-tag [value]="u.role"
                   [severity]="u.role === 'Admin' ? 'danger' : 'info'" />
          </td>
          <td>{{ u.createdAt | date:'mediumDate' }}</td>
          <td>
            <div class="action-btns">
              <p-button icon="pi pi-trash" severity="danger" [text]="true"
                        (click)="confirmDelete(u)"
                        [disabled]="u.username === currentUser" />
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="4" class="text-center">No users found.</td></tr>
      </ng-template>
    </p-table>
    </div>

    <p-dialog header="Add New User" [(visible)]="showDialog" [modal]="true"
              [style]="{ width: '90vw', 'max-width': '420px' }">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-field">
          <label class="form-label">Username *</label>
          <input pInputText formControlName="username" class="w-full" placeholder="Enter username" />
        </div>
        <div class="form-field">
          <label class="form-label">Password *</label>
          <p-password formControlName="password" [feedback]="false" [toggleMask]="true"
                      styleClass="w-full" inputStyleClass="w-full" placeholder="Enter password" />
        </div>
        <div class="form-field">
          <label class="form-label">Role *</label>
          <p-dropdown formControlName="role" [options]="roleOptions"
                      optionLabel="label" optionValue="value" styleClass="w-full" />
        </div>
        <div class="dialog-footer">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="showDialog = false" />
          <p-button label="Create User" type="submit" [disabled]="form.invalid || saving" [loading]="saving" />
        </div>
      </form>
    </p-dialog>
  `
})
export class UsersComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  users: AppUser[] = [];
  loading = true;
  showDialog = false;
  saving = false;
  currentUser = this.authService.getUsername();

  roleOptions = [
    { label: 'User', value: 'User' },
    { label: 'Admin', value: 'Admin' }
  ];

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('User', Validators.required)
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.authService.getUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog() {
    this.form.reset({ role: 'User' });
    this.showDialog = true;
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.authService.createUser({
      username: this.form.value.username!,
      password: this.form.value.password!,
      role: this.form.value.role!
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'User created' });
        this.showDialog = false;
        this.saving = false;
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  confirmDelete(u: AppUser) {
    this.confirmationService.confirm({
      message: `Delete user "${u.username}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      accept: () => {
        this.authService.deleteUser(u.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'User deleted' });
            this.load();
          }
        });
      }
    });
  }
}
