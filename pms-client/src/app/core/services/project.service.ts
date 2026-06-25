import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProject, UpdateProject } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/projects`;

  getAll(status?: string, open?: boolean): Observable<Project[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (open != null) params = params.set('open', open);
    return this.http.get<Project[]>(this.base, { params });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  create(dto: CreateProject): Observable<Project> {
    return this.http.post<Project>(this.base, dto);
  }

  update(id: number, dto: UpdateProject): Observable<Project> {
    return this.http.put<Project>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
