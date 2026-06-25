import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DisciplineService } from '../../../core/services/discipline.service';

@Component({
  selector: 'app-discipline-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, InputTextareaModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <p-card [header]="isEdit ? 'Edit Discipline' : 'New Discipline'" styleClass="max-w-lg">
      <form [formGroup]="form" (ngSubmit)="submit()">

        <div class="form-field">
          <label for="name" class="form-label">Name *</label>
          <input pInputText id="name" formControlName="name" class="w-full" />
        </div>

        <div class="form-field">
          <label for="desc" class="form-label">Description</label>
          <textarea pInputTextarea id="desc" formControlName="description" class="w-full" rows="3"></textarea>
        </div>

        <div class="form-footer">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="cancel()"></p-button>
          <p-button label="Save Discipline" type="submit" [disabled]="form.invalid || saving" [loading]="saving"></p-button>
        </div>
      </form>
    </p-card>
  `
})
export class DisciplineFormComponent implements OnInit {
  private readonly disciplineService = inject(DisciplineService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  isEdit = false;
  saving = false;
  private id!: number;

  form = new FormGroup({
    name:        new FormControl('', Validators.required),
    description: new FormControl('')
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.id = +idParam;
      this.disciplineService.getById(this.id).subscribe(d => this.form.patchValue(d));
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    const dto = { name: this.form.value.name!, description: this.form.value.description ?? undefined };
    const op$ = this.isEdit
      ? this.disciplineService.update(this.id, dto)
      : this.disciplineService.create(dto);

    op$.subscribe({
      next: () => this.router.navigate(['/disciplines']),
      error: () => { this.saving = false; }
    });
  }

  cancel() { this.router.navigate(['/disciplines']); }
}
