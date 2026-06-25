# Frontend Guide — Angular 20 + PrimeNG 20

## Project Setup

```bash
# Create Angular project
ng new pms-client --routing --style=scss --standalone

cd pms-client

# Install PrimeNG and dependencies
npm install primeng @primeng/themes primeicons

# If using PrimeNG chart components
npm install chart.js
```

---

## styles.scss — Global PrimeNG Theme

```scss
// styles.scss
@use "primeng/resources/themes/lara-light-blue/theme.css";
@use "primeng/resources/primeng.css";
@use "primeicons/primeicons.css";

body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--surface-ground);
}
```

---

## app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    provideAnimationsAsync(),
  ]
};
```

---

## app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component')
                                                 .then(m => m.DashboardComponent) },
      { path: 'employees', loadChildren: () => import('./features/employees/employees.routes')
                                                .then(m => m.employeeRoutes) },
      { path: 'projects',  loadChildren: () => import('./features/projects/projects.routes')
                                                .then(m => m.projectRoutes) },
      { path: 'disciplines', loadChildren: () => import('./features/disciplines/disciplines.routes')
                                                  .then(m => m.disciplineRoutes) },
      { path: 'assignments', loadChildren: () => import('./features/assignments/assignments.routes')
                                                  .then(m => m.assignmentRoutes) },
    ]
  }
];
```

---

## Core Models

```typescript
// core/models/employee.model.ts
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'available' | 'unavailable';
  disciplines: Discipline[];
}

// core/models/project.model.ts
export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on_hold';
  totalRequired: number;
  totalFilled: number;
  totalOpen: number;
  disciplineRequirements: ProjectDiscipline[];
}

export interface ProjectDiscipline {
  id: number;
  disciplineId: number;
  disciplineName: string;
  requiredCount: number;
  filledCount: number;
  openCount: number;
}

// core/models/assignment.model.ts
export interface CreateAssignment {
  employeeId: number;
  projectDisciplineId: number;
  startDate: string;
  endDate: string;
}
```

---

## Core Services

```typescript
// core/services/employee.service.ts
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(status?: string, disciplineId?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (disciplineId) params = params.set('disciplineId', disciplineId);
    return this.http.get<Employee[]>(this.base, { params });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.base}/${id}`);
  }

  create(dto: Partial<Employee> & { disciplineIds: number[] }): Observable<Employee> {
    return this.http.post<Employee>(this.base, dto);
  }

  update(id: number, dto: Partial<Employee> & { disciplineIds: number[] }): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

```typescript
// core/services/assignment.service.ts
@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/assignments`;

  getEligibleEmployees(projectDisciplineId: number): Observable<EligibleEmployee[]> {
    return this.http.get<EligibleEmployee[]>(`${this.base}/eligible-employees/${projectDisciplineId}`);
  }

  getEligibleProjects(employeeId: number): Observable<EligibleProject[]> {
    return this.http.get<EligibleProject[]>(`${this.base}/eligible-projects/${employeeId}`);
  }

  create(dto: CreateAssignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.base, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

---

## Feature Components

### Dashboard (`features/dashboard/`)

Uses PrimeNG `<p-card>`, `<p-chart>`, `<p-knob>` components.

**Stats displayed:**
- Total projects with open positions (Card)
- Open positions by discipline (Bar chart via `<p-chart>`)
- Total available employees (Card)
- Available employees by discipline (Bar chart)

```html
<!-- dashboard.component.html (excerpt) -->
<div class="grid">
  <div class="col-12 md:col-6 lg:col-3">
    <p-card header="Projects with Open Positions" styleClass="h-full">
      <p class="text-5xl font-bold text-primary">{{ summary.totalProjectsWithOpenPositions }}</p>
    </p-card>
  </div>
  <div class="col-12 md:col-6 lg:col-3">
    <p-card header="Available Employees" styleClass="h-full">
      <p class="text-5xl font-bold text-green-500">{{ summary.totalAvailableEmployees }}</p>
    </p-card>
  </div>
</div>

<div class="grid mt-3">
  <div class="col-12 md:col-6">
    <p-card header="Open Positions by Discipline">
      <p-chart type="bar" [data]="openPositionsChartData" [options]="chartOptions" />
    </p-card>
  </div>
  <div class="col-12 md:col-6">
    <p-card header="Available Employees by Discipline">
      <p-chart type="bar" [data]="availabilityChartData" [options]="chartOptions" />
    </p-card>
  </div>
</div>
```

---

### Employee List (`features/employees/employee-list/`)

Uses PrimeNG `<p-table>` with filtering, sorting, and pagination.

**Key PrimeNG components:** `p-table`, `p-tag`, `p-button`, `p-inputText`, `p-confirmDialog`

```html
<p-table [value]="employees" [paginator]="true" [rows]="15"
         [globalFilterFields]="['firstName','lastName','email']"
         [loading]="loading">

  <ng-template pTemplate="caption">
    <div class="flex justify-content-between">
      <p-button label="Add Employee" icon="pi pi-plus" routerLink="new" />
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText placeholder="Search..." (input)="table.filterGlobal($event.target.value, 'contains')" />
      </span>
    </div>
  </ng-template>

  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="lastName">Name <p-sortIcon field="lastName" /></th>
      <th>Email</th>
      <th>Disciplines</th>
      <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
      <th>Actions</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-employee>
    <tr>
      <td>{{ employee.lastName }}, {{ employee.firstName }}</td>
      <td>{{ employee.email }}</td>
      <td>
        <p-tag *ngFor="let d of employee.disciplines" [value]="d.name" styleClass="mr-1" />
      </td>
      <td>
        <p-tag [value]="employee.status"
               [severity]="employee.status === 'available' ? 'success' : 'warning'" />
      </td>
      <td>
        <p-button icon="pi pi-eye"   severity="secondary" [routerLink]="[employee.id]" />
        <p-button icon="pi pi-pencil" severity="info"      [routerLink]="[employee.id, 'edit']" />
        <p-button icon="pi pi-trash"  severity="danger"    (click)="confirmDelete(employee)" />
      </td>
    </tr>
  </ng-template>
</p-table>
```

---

### Employee Form (`features/employees/employee-form/`)

Uses PrimeNG `<p-multiSelect>` for discipline selection.

**Key PrimeNG components:** `p-floatLabel`, `p-inputText`, `p-multiSelect`, `p-button`

```typescript
@Component({ ... })
export class EmployeeFormComponent implements OnInit {
  form = new FormGroup({
    firstName:     new FormControl('', Validators.required),
    lastName:      new FormControl('', Validators.required),
    email:         new FormControl('', [Validators.required, Validators.email]),
    phone:         new FormControl(''),
    disciplineIds: new FormControl<number[]>([], Validators.required)
  });

  disciplines = signal<Discipline[]>([]);
  employeeId = input<number | null>(null);  // null = create mode

  ngOnInit() {
    this.disciplineService.getAll().subscribe(d => this.disciplines.set(d));
    if (this.employeeId()) {
      this.employeeService.getById(this.employeeId()!).subscribe(emp => this.form.patchValue({
        ...emp, disciplineIds: emp.disciplines.map(d => d.id)
      }));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const op$ = this.employeeId()
      ? this.employeeService.update(this.employeeId()!, this.form.value as any)
      : this.employeeService.create(this.form.value as any);
    op$.subscribe(() => this.router.navigate(['/employees']));
  }
}
```

---

### Assign by Project (`features/assignments/assign-by-project/`)

**Flow:** Project list → select open discipline slot → dialog with eligible employees → set dates → confirm.

**Key PrimeNG components:** `p-table`, `p-dialog`, `p-dropdown`, `p-calendar`, `p-steps`

```html
<!-- Step 1: List projects with open positions -->
<p-table [value]="projects" ...>
  <ng-template pTemplate="body" let-project>
    <tr>
      <td>{{ project.name }}</td>
      <td>
        <p-badge [value]="project.totalOpen" severity="warning" />
      </td>
      <td>
        <p-button label="Assign" icon="pi pi-user-plus"
                  (click)="selectProject(project)" />
      </td>
    </tr>
  </ng-template>
</p-table>

<!-- Step 2: Dialog - pick discipline slot -->
<p-dialog [(visible)]="showSlotDialog" header="Select Discipline Slot" [modal]="true">
  <p-listbox [options]="selectedProject.disciplineRequirements | openSlots"
             optionLabel="disciplineName"
             (onChange)="selectSlot($event.value)" />
</p-dialog>

<!-- Step 3: Dialog - pick employee and set dates -->
<p-dialog [(visible)]="showEmployeeDialog" header="Assign Employee" [modal]="true">
  <p-dropdown [options]="eligibleEmployees"
              optionLabel="firstName"
              placeholder="Select Employee"
              [(ngModel)]="selectedEmployee" />
  <p-calendar [(ngModel)]="startDate" placeholder="Start Date" />
  <p-calendar [(ngModel)]="endDate"   placeholder="End Date" [minDate]="startDate" />
  <p-button label="Confirm Assignment" (click)="confirmAssignment()" />
</p-dialog>
```

---

### Assign by Employee (`features/assignments/assign-by-employee/`)

**Flow:** Search employee → view eligible projects → select project + discipline → set dates → confirm.

---

## Layout Components

### Sidebar (`layout/sidebar/`)

PrimeNG `<p-panelMenu>` or `<p-menu>` component.

```typescript
menuItems: MenuItem[] = [
  { label: 'Dashboard',   icon: 'pi pi-home',        routerLink: '/dashboard' },
  { label: 'Employees',   icon: 'pi pi-users',        routerLink: '/employees' },
  { label: 'Projects',    icon: 'pi pi-briefcase',    routerLink: '/projects' },
  { label: 'Disciplines', icon: 'pi pi-tags',         routerLink: '/disciplines' },
  { separator: true },
  { label: 'Assign by Project',  icon: 'pi pi-sitemap', routerLink: '/assignments/by-project' },
  { label: 'Assign by Employee', icon: 'pi pi-user',    routerLink: '/assignments/by-employee' },
];
```

---

## environment.ts

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api'   // proxied through the same origin in production
};
```

---

## Running the Client

```bash
# From pms-client/
ng serve

# App: http://localhost:4200
```
