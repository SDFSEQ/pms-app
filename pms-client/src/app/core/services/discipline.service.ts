import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Discipline } from '../models/discipline.model';

@Injectable({ providedIn: 'root' })
export class DisciplineService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/disciplines`;

  getAll(): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(this.base);
  }

  getById(id: number): Observable<Discipline> {
    return this.http.get<Discipline>(`${this.base}/${id}`);
  }

  create(dto: { name: string; description?: string }): Observable<Discipline> {
    return this.http.post<Discipline>(this.base, dto);
  }

  update(id: number, dto: { name: string; description?: string }): Observable<Discipline> {
    return this.http.put<Discipline>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
