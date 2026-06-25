import { Routes } from '@angular/router';

export const assignmentRoutes: Routes = [
  { path: 'by-project', loadComponent: () => import('./assign-by-project/assign-by-project.component').then(m => m.AssignByProjectComponent) },
  { path: 'by-employee', loadComponent: () => import('./assign-by-employee/assign-by-employee.component').then(m => m.AssignByEmployeeComponent) },
];
