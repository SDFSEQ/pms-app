# PMS Developer Context

You are working on a **Project Management System (PMS)** — a full-stack app for assigning employees to projects by discipline.

## Stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Backend  | .NET 8 Web API, Entity Framework Core, Npgsql |
| Frontend | Angular 17, PrimeNG, standalone components    |
| Database | PostgreSQL (Neon.tech cloud)                  |

## How to Run

**Both terminals must be open simultaneously.**

```powershell
# Terminal 1 — API (port 5000)
cd pms-api
dotnet run --project PMS.API --launch-profile http

# Terminal 2 — Frontend (port 4200)
cd pms-client
npm start
```

URLs:
- App: http://localhost:4200
- Swagger: http://localhost:5000/swagger

**After any model change**, run migrations before restarting:
```powershell
# Stop the API first (it locks the exe), then:
cd pms-api
dotnet ef migrations add <MigrationName> --project PMS.API
dotnet ef database update --project PMS.API
```

**PATH note** — .NET and tools may not be on the default PowerShell PATH. Prefix commands with:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User") + ";$env:USERPROFILE\.dotnet\tools"
```

---

## Domain Model

```
Discipline        — e.g. Civil Engineer, Electrical Engineer (seeded, 5 exist)
Employee          — has many Disciplines (via EmployeeDiscipline join)
                    Status: Available | Unavailable
Project           — has many ProjectDisciplines, Status: Active | Completed | OnHold
ProjectDiscipline — one slot type per project: DisciplineId, RequiredCount, FilledCount
Assignment        — links Employee → ProjectDiscipline with StartDate/EndDate
                    creating one marks Employee Unavailable and increments FilledCount
```

---

## Backend Architecture (`pms-api/PMS.API/`)

### File layout

```
Models/           — EF entity classes
DTOs/             — Request/response shapes (Create*, Update*, *Dto)
Data/
  AppDbContext.cs — DbContext, OnModelCreating, seed data
Services/
  Interfaces/     — I*Service interfaces
  *Service.cs     — Business logic, EF queries
Controllers/      — Thin: call service, return Ok/Created/NoContent
Exceptions/       — NotFoundException, ConflictException, GlobalExceptionHandler
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
    // navigation properties
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

**Register DbSet in AppDbContext**
```csharp
public DbSet<Foo> Foos => Set<Foo>();
```

---

## Frontend Architecture (`pms-client/src/app/`)

### File layout

```
core/
  models/         — TypeScript interfaces matching backend DTOs
  services/       — Angular services, one per entity
features/
  <entity>/
    <entity>.routes.ts
    <entity>-list/
    <entity>-form/
    <entity>-detail/
layout/           — MainLayout, Sidebar, Topbar
shared/components — Reusable UI (StatusBadge, etc.)
environments/     — environment.ts: apiUrl = '/api'
```

All components are **standalone** (`standalone: true` in decorator).

### Patterns to follow

**Model** (`core/models/foo.model.ts`)
```typescript
export interface Foo {
  id: number;
  name: string;
}
export interface CreateFoo {
  name: string;
}
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

**Register route in app.routes.ts**
```typescript
{ path: 'foos', loadChildren: () => import('./features/foos/foos.routes').then(m => m.fooRoutes) },
```

**Add to sidebar** (`layout/sidebar/sidebar.component.ts`) — add a nav item matching the route path.

**UI library**: PrimeNG — use `p-table`, `p-button`, `p-dialog`, `p-card`, `p-inputText`, `p-dropdown`, `p-calendar`, `p-badge`, `p-toast`, `ConfirmDialog`.

**Error handling**: The `api-error.interceptor.ts` already catches HTTP errors globally and shows PrimeNG toasts. No per-call try/catch needed in components.

---

## Existing API Endpoints

| Method | Route                                    | Description                          |
|--------|------------------------------------------|--------------------------------------|
| GET    | /api/disciplines                         | List all disciplines                 |
| POST   | /api/disciplines                         | Create discipline                    |
| GET    | /api/employees?status=&disciplineId=     | List employees (filterable)          |
| GET    | /api/employees/{id}                      | Employee detail with assignments     |
| POST   | /api/employees                           | Create employee                      |
| PUT    | /api/employees/{id}                      | Update employee                      |
| DELETE | /api/employees/{id}                      | Delete employee (no history only)    |
| GET    | /api/projects                            | List projects with slot counts       |
| GET    | /api/projects/{id}                       | Project detail with discipline slots |
| POST   | /api/projects                            | Create project                       |
| PUT    | /api/projects/{id}                       | Update project                       |
| DELETE | /api/projects/{id}                       | Delete project                       |
| GET    | /api/assignments                         | List all assignments                 |
| POST   | /api/assignments                         | Create assignment                    |
| DELETE | /api/assignments/{id}                    | Remove assignment (frees employee)   |
| GET    | /api/assignments/eligible-employees/{projectDisciplineId} | Available employees for a slot |
| GET    | /api/assignments/eligible-projects/{employeeId}           | Open projects for an employee  |
| GET    | /api/dashboard                           | Summary stats for homepage           |

---

## Checklist: Adding a New Feature End-to-End

### Backend
- [ ] Add model in `Models/`
- [ ] Add `DbSet<>` to `AppDbContext`
- [ ] Add any configuration to `OnModelCreating` (indexes, relationships, seed)
- [ ] Add DTOs in `DTOs/<Entity>/`
- [ ] Add interface in `Services/Interfaces/`
- [ ] Implement service in `Services/`
- [ ] Add controller in `Controllers/`
- [ ] Register service in `Program.cs`
- [ ] Stop API → run `dotnet ef migrations add <Name> --project PMS.API` → `dotnet ef database update --project PMS.API` → restart API

### Frontend
- [ ] Add model interface in `core/models/`
- [ ] Add service in `core/services/`
- [ ] Create feature folder `features/<entity>/` with list, form, detail components
- [ ] Create `<entity>.routes.ts`
- [ ] Register in `app.routes.ts`
- [ ] Add nav item to `layout/sidebar/sidebar.component.ts`
