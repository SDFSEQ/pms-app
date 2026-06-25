import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, CreateEmployee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(status?: string, disciplineId?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (disciplineId != null) params = params.set('disciplineId', disciplineId);
    return this.http.get<Employee[]>(this.base, { params });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.base}/${id}`);
  }

  create(dto: CreateEmployee): Observable<Employee> {
    return this.http.post<Employee>(this.base, dto);
  }

  update(id: number, dto: CreateEmployee): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
