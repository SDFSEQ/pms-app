# PMS Developer Context

You are working on a **Project Management System (PMS)** — a full-stack app for assigning employees to projects by discipline, with JWT authentication, role-based access, and a responsive UI.

## Stack

| Layer    | Tech                                                        |
|----------|-------------------------------------------------------------|
| Backend  | .NET 8 Web API, Entity Framework Core, Npgsql, JWT Bearer  |
| Frontend | Angular 17, PrimeNG 17, standalone components, SCSS        |
| Database | PostgreSQL (Neon.tech cloud)                                |
| Hosting  | Render (API) + Vercel (frontend)                           |

## Live URLs

| | URL |
|---|---|
| **Frontend** | https://pms-app-beta.vercel.app |
| **API** | https://pms-api-aoly.onrender.com |
| **Swagger** | https://pms-api-aoly.onrender.com/swagger |

---

## How to Run Locally

**Both terminals must be open simultaneously.**

```powershell
# Terminal 1 — API (port 5000)
cd pms-api
dotnet run --project PMS.API --launch-profile http

# Terminal 2 — Frontend (port 4200)
cd pms-client
npm start
```

Local URLs:
- App: http://localhost:4200
- Swagger: http://localhost:5000/swagger

**Default login:** `admin` / `Admin@123`

**After any model change**, run migrations before restarting the API:
```powershell
# Stop the API first (it locks the exe), then:
cd pms-api
dotnet ef migrations add <MigrationName> --project PMS.API
dotnet ef database update --project PMS.API
```

**PATH note** — Prefix dotnet/ef commands with:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User") + ";$env:USERPROFILE\.dotnet\tools"
```

---

## Domain Model

```
AppUser           — Username, PasswordHash, Role (Admin | User)
                    Seeded: admin / Admin@123 on first startup if no users exist
Discipline        — e.g. Civil Engineer, Electrical Engineer (seeded, 5 exist)
Employee          — has many Disciplines (via EmployeeDiscipline join)
                    Status: Available | Unavailable
Project           — has many ProjectDisciplines, Status: Active | Completed | OnHold
ProjectDiscipline — one slot type per project: DisciplineId, RequiredCount, FilledCount
Assignment        — links Employee → ProjectDiscipline with StartDate/EndDate
                    creating one marks Employee Unavailable and increments FilledCount
```

---

## Authentication & Authorization

### How it works
- Login via `POST /api/auth/login` → returns a signed JWT (8-hour expiry)
- JWT is stored in `localStorage` under keys `pms_token`, `pms_username`, `pms_role`
- `authInterceptor` attaches `Authorization: Bearer <token>` to every API request
- `authGuard` protects all routes — redirects to `/login` if not authenticated
- `adminGuard` protects `/users` — redirects to `/dashboard` if not Admin role
- All API controllers require `[Authorize]` — `AuthController.Login` is `[AllowAnonymous]`

### Roles
| Role | Capabilities |
|---|---|
| `User` | View and use all features |
| `Admin` | Everything + User Management page |

### Key files
- `core/services/auth.service.ts` — login, logout, token helpers, user CRUD
- `core/guards/auth.guard.ts` — blocks unauthenticated access
- `core/guards/admin.guard.ts` — blocks non-admin access
- `core/interceptors/auth.interceptor.ts` — adds Bearer token to all requests
- `features/auth/login/login.component.ts` — login page
- `features/users/users.component.ts` — admin-only user management
- `pms-api/PMS.API/Services/AuthService.cs` — JWT generation, password hashing
- `pms-api/PMS.API/Controllers/AuthController.cs` — login + user CRUD endpoints

### Adding a new protected route (admin-only example)
```typescript
{ path: 'reports', loadComponent: ..., canActivate: [authGuard, adminGuard] }
```

---

## Backend Architecture (`pms-api/PMS.API/`)

### File layout

```
Models/           — EF entity classes (AppUser, Employee, Project, etc.)
DTOs/             — Request/response shapes (Create*, Update*, *Dto)
Data/
  AppDbContext.cs — DbContext, OnModelCreating, seed data
Services/
  Interfaces/     — I*Service interfaces
  *Service.cs     — Business logic, EF queries
Controllers/      — Thin: [Authorize] + call service + return Ok/Created/NoContent
Exceptions/       — NotFoundException, ConflictException, GlobalExceptionHandler
Migrations/       — EF Core migration files
```

### Patterns to follow

**Model** (`Models/Foo.cs`)
```csharp
public class Foo
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

**DTOs** (`DTOs/Foo/FooDto.cs`) — one file per entity with `FooDto`, `CreateFooDto`, `UpdateFooDto`

**Interface** (`Services/Interfaces/IFooService.cs`)
```csharp
public interface IFooService
{
    Task<List<FooDto>> GetAllAsync();
    Task<FooDto> GetByIdAsync(int id);
    Task<FooDto> CreateAsync(CreateFooDto dto);
    Task<FooDto> UpdateAsync(int id, UpdateFooDto dto);
    Task DeleteAsync(int id);
}
```

**Service** (`Services/FooService.cs`)
```csharp
public class FooService(AppDbContext db) : IFooService
{
    // Use db.Foos.Include(...).FirstOrDefaultAsync(...)
    // Throw NotFoundException("Foo", id) for missing records
    // Throw ConflictException("...") for business rule violations
    // Map to DTO with private static FooDto ToDto(Foo f) => new() { ... }
}
```

**Controller** (`Controllers/FoosController.cs`)
```csharp
[Authorize]                          // ← required on every controller
[ApiController]
[Route("api/[controller]")]
public class FoosController(IFooService fooService) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await fooService.GetAllAsync());
    [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) => Ok(await fooService.GetByIdAsync(id));
    [HttpPost] public async Task<IActionResult> Create([FromBody] CreateFooDto dto) { var c = await fooService.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = c.Id }, c); }
    [HttpPut("{id:int}")] public async Task<IActionResult> Update(int id, [FromBody] UpdateFooDto dto) => Ok(await fooService.UpdateAsync(id, dto));
    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) { await fooService.DeleteAsync(id); return NoContent(); }
}
```

**Register in Program.cs**
```csharp
builder.Services.AddScoped<IFooService, FooService>();
```

**Register DbSet in AppDbContext.cs**
```csharp
public DbSet<Foo> Foos => Set<Foo>();
```

---

## Frontend Architecture (`pms-client/src/app/`)

### File layout

```
core/
  models/         — TypeScript interfaces matching backend DTOs (incl. auth.model.ts)
  services/       — Angular services per entity (incl. auth.service.ts)
  guards/         — auth.guard.ts, admin.guard.ts
  interceptors/   — auth.interceptor.ts (Bearer token), api-error.interceptor.ts (toast errors)
features/
  auth/login/     — Login page (no layout wrapper, standalone)
  dashboard/      — KPI cards + discipline tiles (no charts)
  employees/      — list, form, detail
  projects/       — list, form, detail
  disciplines/    — list, form
  assignments/    — assign-by-project, assign-by-employee
  users/          — Admin-only user management (users.component.ts)
layout/
  main-layout/    — Grid shell: sidebar (240px) + main area; handles sidebar drawer state
  sidebar/        — Dark nav sidebar; emits closeRequest; shows User Management for admins
  topbar/         — Hamburger button (emits menuToggle), date
shared/components — StatusBadge, etc.
environments/
  environment.ts       — apiUrl: '/api' (dev, uses proxy)
  environment.prod.ts  — apiUrl: 'https://pms-api-aoly.onrender.com/api'
```

All components are **standalone** (`standalone: true` in decorator).

### Responsive layout behaviour
- **≥ 1024px**: sidebar always visible (fixed 240px column)
- **< 1024px**: sidebar hidden; hamburger ☰ in topbar opens it as a slide-in drawer with dark overlay
- Clicking the overlay, any nav link, or the × button closes the drawer
- Content padding reduces to 1rem on mobile

### Patterns to follow

**Model** (`core/models/foo.model.ts`)
```typescript
export interface Foo { id: number; name: string; }
export interface CreateFoo { name: string; }
```

**Service** (`core/services/foo.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class FooService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/foos`;

  getAll(): Observable<Foo[]> { return this.http.get<Foo[]>(this.base); }
  getById(id: number): Observable<Foo> { return this.http.get<Foo>(`${this.base}/${id}`); }
  create(dto: CreateFoo): Observable<Foo> { return this.http.post<Foo>(this.base, dto); }
  update(id: number, dto: CreateFoo): Observable<Foo> { return this.http.put<Foo>(`${this.base}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

**Routes** (`features/foos/foos.routes.ts`)
```typescript
export const fooRoutes: Routes = [
  { path: '', loadComponent: () => import('./foo-list/foo-list.component').then(m => m.FooListComponent) },
  { path: 'new', loadComponent: () => import('./foo-form/foo-form.component').then(m => m.FooFormComponent) },
  { path: ':id', loadComponent: () => import('./foo-detail/foo-detail.component').then(m => m.FooDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./foo-form/foo-form.component').then(m => m.FooFormComponent) },
];
```

**Register in app.routes.ts** (inside the `canActivate: [authGuard]` parent):
```typescript
{ path: 'foos', loadChildren: () => import('./features/foos/foos.routes').then(m => m.fooRoutes) },
```

**Add to sidebar** — add a `MenuItem` to `menuItems` or `assignItems` array in `sidebar.component.ts`.

---

## UI Conventions

### Form layout — use global utility classes from `styles.scss`

```html
<p-card header="New Foo" styleClass="max-w-lg">
  <form [formGroup]="form" (ngSubmit)="submit()">

    <!-- Two fields side-by-side (stacks below md) -->
    <div class="form-row">
      <div class="form-field flex-1">
        <label class="form-label">First Name *</label>
        <input pInputText formControlName="firstName" class="w-full" />
      </div>
      <div class="form-field flex-1">
        <label class="form-label">Last Name *</label>
        <input pInputText formControlName="lastName" class="w-full" />
      </div>
    </div>

    <!-- Single field -->
    <div class="form-field">
      <label class="form-label">Email *</label>
      <input pInputText formControlName="email" class="w-full" />
    </div>

    <!-- Footer with divider -->
    <div class="form-footer">
      <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="cancel()" />
      <p-button label="Save" type="submit" [disabled]="form.invalid || saving" [loading]="saving" />
    </div>
  </form>
</p-card>
```

### Dialog layout

```html
<p-dialog header="..." [(visible)]="show" [modal]="true"
          [style]="{ width: '90vw', 'max-width': '540px' }">
  <div class="form-field">
    <label class="form-label">Field *</label>
    <p-dropdown ... styleClass="w-full" />
  </div>
  <div class="form-row">
    <div class="form-field flex-1">
      <label class="form-label">Start Date *</label>
      <p-calendar ... styleClass="w-full" appendTo="body" />
    </div>
    <div class="form-field flex-1">
      <label class="form-label">End Date *</label>
      <p-calendar ... styleClass="w-full" appendTo="body" />
    </div>
  </div>
  <div class="dialog-footer">
    <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="show = false" />
    <p-button label="Confirm" icon="pi pi-check" ... />
  </div>
</p-dialog>
```

### Table layout — always wrap in `.table-wrapper` for mobile scroll

```html
<div class="table-wrapper">
  <p-table [value]="items" styleClass="p-datatable-striped" [paginator]="true" [rows]="15">
    <ng-template pTemplate="header">
      <tr>
        <th>Name</th>
        <th class="hide-mobile">Email</th>   <!-- hidden on mobile -->
        <th class="hide-tablet">Phone</th>   <!-- hidden on tablet + mobile -->
        <th style="width:110px">Actions</th>
      </tr>
    </ng-template>
    ...
  </p-table>
</div>
```

Available responsive helper classes: `hide-mobile` (hidden < 640px), `hide-tablet` (hidden < 960px).

### Dashboard / summary pages — KPI cards + discipline tiles (NO charts)

```html
<!-- KPI cards -->
<div class="kpi-grid">
  <div class="kpi-card blue" routerLink="/target">
    <div class="kpi-icon"><i class="pi pi-folder-open"></i></div>
    <div class="kpi-content">
      <div class="kpi-number">{{ count }}</div>
      <div class="kpi-label">Label</div>
    </div>
    <i class="pi pi-arrow-right kpi-arrow"></i>
  </div>
</div>

<!-- Discipline/category breakdown tiles -->
<div class="section-grid">
  <div class="section-card">
    <div class="section-header">
      <div class="section-header-icon orange"><i class="pi pi-exclamation-triangle"></i></div>
      <div><h3>Title</h3><span class="section-sub">Subtitle</span></div>
    </div>
    <div class="disc-list">
      @for (d of items; track d.id; let i = $index) {
        <div class="disc-row">
          <div class="disc-badge" [style.background]="palette[i % palette.length]">{{ d.count }}</div>
          <div class="disc-info">
            <div class="disc-name">{{ d.name }}</div>
            <div class="disc-bar-track">
              <div class="disc-bar-fill" [style.width.%]="pct(d.count, max)" [style.background]="palette[i % palette.length]"></div>
            </div>
          </div>
          <span class="disc-count-label">{{ d.count }} open</span>
        </div>
      }
    </div>
  </div>
</div>
```

Color palette (in component TS): `readonly palette = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899']`

KPI card color variants: `blue`, `orange`, `green` (defined in `dashboard.component.scss`).

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` except `/api/auth/login`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/login | Public | Returns JWT token |
| GET | /api/auth/users | Admin | List all app users |
| POST | /api/auth/users | Admin | Create new user |
| DELETE | /api/auth/users/{id} | Admin | Delete user |
| GET | /api/disciplines | User+ | List all disciplines |
| POST | /api/disciplines | User+ | Create discipline |
| GET | /api/employees?status=&disciplineId= | User+ | List employees |
| GET | /api/employees/{id} | User+ | Employee detail + assignments |
| POST | /api/employees | User+ | Create employee |
| PUT | /api/employees/{id} | User+ | Update employee |
| DELETE | /api/employees/{id} | User+ | Delete (no history only) |
| GET | /api/projects | User+ | List projects with slot counts |
| GET | /api/projects/{id} | User+ | Project detail |
| POST | /api/projects | User+ | Create project |
| PUT | /api/projects/{id} | User+ | Update project |
| DELETE | /api/projects/{id} | User+ | Delete project |
| GET | /api/assignments | User+ | List assignments |
| POST | /api/assignments | User+ | Create assignment |
| DELETE | /api/assignments/{id} | User+ | Remove assignment |
| GET | /api/assignments/eligible-employees/{pdId} | User+ | Available employees for slot |
| GET | /api/assignments/eligible-projects/{empId} | User+ | Open projects for employee |
| GET | /api/dashboard | User+ | Summary stats |

---

## Deployment

### Push to production
```powershell
git add .
git commit -m "description"
git push
# Vercel auto-redeploys frontend (~2 min)
# Render auto-redeploys API via Docker (~5 min)
```

### Render environment variables (API)
| Key | Value |
|---|---|
| `ConnectionStrings__DefaultConnection` | Neon connection string |
| `AllowedOrigins` | `https://pms-app-beta.vercel.app` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Jwt__Key` / `Jwt__Issuer` / `Jwt__Audience` | Set if overriding appsettings.json |

### Vercel settings (Frontend)
- Root Directory: `pms-client`
- Build Command: `npm run build -- --configuration production`
- Output Directory: `dist/pms-client/browser`

### Notes
- Render free tier sleeps after 15 min idle → ~30s cold start on first hit
- `angular.json` production config has `fileReplacements` to swap `environment.ts` → `environment.prod.ts`
- Admin user auto-seeded on API startup if `AppUsers` table is empty

---

## Checklist: Adding a New Feature End-to-End

### Backend
- [ ] Add model in `Models/`
- [ ] Add `DbSet<>` to `AppDbContext` + configure in `OnModelCreating` if needed
- [ ] Add DTOs in `DTOs/<Entity>/`
- [ ] Add interface in `Services/Interfaces/`
- [ ] Implement service in `Services/`
- [ ] Add controller in `Controllers/` with `[Authorize]` at class level
- [ ] Register service in `Program.cs`
- [ ] Stop API → `dotnet ef migrations add <Name> --project PMS.API` → `dotnet ef database update --project PMS.API` → restart

### Frontend
- [ ] Add model interface in `core/models/`
- [ ] Add service in `core/services/`
- [ ] Create feature folder with list, form, detail components
- [ ] Create `<entity>.routes.ts`
- [ ] Register in `app.routes.ts` inside the `canActivate: [authGuard]` parent (add `adminGuard` if admin-only)
- [ ] Add nav item to `layout/sidebar/sidebar.component.ts` (wrap in `@if (auth.isAdmin())` if admin-only)
- [ ] Wrap all `p-table` in `<div class="table-wrapper">` for mobile scroll
- [ ] Use `form-field`, `form-row`, `form-footer` classes for all forms
- [ ] Use `hide-mobile` / `hide-tablet` on non-essential table columns
