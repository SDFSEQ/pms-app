import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees', loadChildren: () => import('./features/employees/employees.routes').then(m => m.employeeRoutes) },
      { path: 'projects', loadChildren: () => import('./features/projects/projects.routes').then(m => m.projectRoutes) },
      { path: 'disciplines', loadChildren: () => import('./features/disciplines/disciplines.routes').then(m => m.disciplineRoutes) },
      { path: 'assignments', loadChildren: () => import('./features/assignments/assignments.routes').then(m => m.assignmentRoutes) },
    ]
  },
  { path: '**', redirectTo: '' }
];
