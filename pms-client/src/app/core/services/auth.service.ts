import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, AppUser, CreateUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, dto).pipe(
      tap(res => {
        localStorage.setItem('pms_token', res.token);
        localStorage.setItem('pms_username', res.username);
        localStorage.setItem('pms_role', res.role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('pms_token');
    localStorage.removeItem('pms_username');
    localStorage.removeItem('pms_role');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return localStorage.getItem('pms_token'); }
  getUsername(): string | null { return localStorage.getItem('pms_username'); }
  getRole(): string | null { return localStorage.getItem('pms_role'); }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  isAdmin(): boolean { return this.getRole() === 'Admin'; }

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.base}/users`);
  }

  createUser(dto: CreateUser): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.base}/users`, dto);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }
}
