import { Routes } from '@angular/router';

export const disciplineRoutes: Routes = [
  { path: '', loadComponent: () => import('./discipline-list/discipline-list.component').then(m => m.DisciplineListComponent) },
  { path: 'new', loadComponent: () => import('./discipline-form/discipline-form.component').then(m => m.DisciplineFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./discipline-form/discipline-form.component').then(m => m.DisciplineFormComponent) },
];
