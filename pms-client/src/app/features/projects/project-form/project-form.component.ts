import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProjectService } from '../../../core/services/project.service';
import { DisciplineService } from '../../../core/services/discipline.service';
import { Discipline } from '../../../core/models/discipline.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, InputTextareaModule, CalendarModule, InputNumberModule, ButtonModule, DropdownModule, ToastModule, DividerModule],
  providers: [MessageService],
  templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly disciplineService = inject(DisciplineService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = false;
  saving = false;
  disciplines: Discipline[] = [];
  private id!: number;

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'OnHold' }
  ];

  form = new FormGroup({
    name:        new FormControl('', Validators.required),
    description: new FormControl(''),
    startDate:   new FormControl<Date | null>(null),
    endDate:     new FormControl<Date | null>(null),
    status:      new FormControl('Active'),
    requirements: new FormArray<FormGroup>([])
  });

  get requirements() { return this.form.get('requirements') as FormArray; }

  ngOnInit() {
    this.disciplineService.getAll().subscribe(d => this.disciplines = d);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.id = +idParam;
      this.projectService.getById(this.id).subscribe(p => {
        this.form.patchValue({
          name: p.name, description: p.description,
          startDate: p.startDate ? new Date(p.startDate) : null,
          endDate: p.endDate ? new Date(p.endDate) : null,
          status: p.status
        });
        p.disciplineRequirements.forEach(r => this.addRequirement(r.disciplineId, r.requiredCount));
      });
    }
  }

  addRequirement(disciplineId = 0, count = 1) {
    this.requirements.push(new FormGroup({
      disciplineId:  new FormControl(disciplineId || null, Validators.required),
      requiredCount: new FormControl(count, [Validators.required, Validators.min(1)])
    }));
  }

  removeRequirement(i: number) { this.requirements.removeAt(i); }

  toDateOnly(d: Date | null): string | undefined {
    if (!d) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const dto: any = {
      name: v.name,
      description: v.description || undefined,
      startDate: this.toDateOnly(v.startDate as Date | null),
      endDate:   this.toDateOnly(v.endDate as Date | null),
      status: v.status ?? 'Active',
      disciplineRequirements: (v.requirements as any[]).map(r => ({
        disciplineId: r.disciplineId,
        requiredCount: r.requiredCount
      }))
    };

    const op$ = this.isEdit
      ? this.projectService.update(this.id, dto)
      : this.projectService.create(dto);

    op$.subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => { this.saving = false; }
    });
  }

  cancel() { this.router.navigate(['/projects']); }
}
