import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { EmployeeService } from '../../../core/services/employee.service';
import { DisciplineService } from '../../../core/services/discipline.service';
import { Discipline } from '../../../core/models/discipline.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, MultiSelectModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly disciplineService = inject(DisciplineService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  isEdit = false;
  saving = false;
  disciplines: Discipline[] = [];
  private id!: number;

  form = new FormGroup({
    firstName:     new FormControl('', Validators.required),
    lastName:      new FormControl('', Validators.required),
    email:         new FormControl('', [Validators.required, Validators.email]),
    phone:         new FormControl(''),
    disciplineIds: new FormControl<number[]>([], [Validators.required, Validators.minLength(1)])
  });

  ngOnInit() {
    this.disciplineService.getAll().subscribe(d => this.disciplines = d);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.id = +idParam;
      this.employeeService.getById(this.id).subscribe(emp =>
        this.form.patchValue({ ...emp, disciplineIds: emp.disciplines.map(d => d.id) })
      );
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    const dto = {
      firstName: this.form.value.firstName!,
      lastName:  this.form.value.lastName!,
      email:     this.form.value.email!,
      phone:     this.form.value.phone || undefined,
      disciplineIds: this.form.value.disciplineIds!
    };
    const op$ = this.isEdit
      ? this.employeeService.update(this.id, dto)
      : this.employeeService.create(dto);

    op$.subscribe({
      next: () => this.router.navigate(['/employees']),
      error: () => { this.saving = false; }
    });
  }

  cancel() { this.router.navigate(['/employees']); }
}
