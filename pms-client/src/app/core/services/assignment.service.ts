import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assignment, CreateAssignment, EligibleEmployee, EligibleProject } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/assignments`;

  getAll(employeeId?: number, projectId?: number, disciplineId?: number): Observable<Assignment[]> {
    let params = new HttpParams();
    if (employeeId != null) params = params.set('employeeId', employeeId);
    if (projectId != null)  params = params.set('projectId', projectId);
    if (disciplineId != null) params = params.set('disciplineId', disciplineId);
    return this.http.get<Assignment[]>(this.base, { params });
  }

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
