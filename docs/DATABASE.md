# Database Design — PostgreSQL 17

## Entity-Relationship Overview

```
disciplines ──────────────────────────────────────────────┐
    │  id, name, description                               │
    │                                                      │
    │ (M:M via employee_disciplines)                       │ (M:M via project_disciplines)
    │                                                      │
employees                                             projects
    │  id, first_name, last_name,                      │  id, name, description,
    │  email, phone, status                             │  start_date, end_date, status
    │                                                      │
    └──────────── assignments ─────────────────────────────┘
                      id, employee_id, project_id,
                      discipline_id, start_date,
                      end_date, duration_days
```

---

## Table Definitions

### `disciplines`
```sql
CREATE TABLE disciplines (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `employees`
```sql
CREATE TABLE employees (
    id           SERIAL PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(200) NOT NULL UNIQUE,
    phone        VARCHAR(20),
    status       VARCHAR(20) NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'unavailable')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `employee_disciplines`  *(many-to-many join)*
```sql
CREATE TABLE employee_disciplines (
    employee_id    INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    discipline_id  INT NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, discipline_id)
);
```

### `projects`
```sql
CREATE TABLE projects (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    start_date   DATE,
    end_date     DATE,
    status       VARCHAR(20) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'completed', 'on_hold')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `project_disciplines`  *(required headcount per discipline per project)*
```sql
CREATE TABLE project_disciplines (
    id             SERIAL PRIMARY KEY,
    project_id     INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    discipline_id  INT NOT NULL REFERENCES disciplines(id),
    required_count INT NOT NULL DEFAULT 1 CHECK (required_count > 0),
    filled_count   INT NOT NULL DEFAULT 0 CHECK (filled_count >= 0),
    UNIQUE (project_id, discipline_id),
    CONSTRAINT filled_lte_required CHECK (filled_count <= required_count)
);
```

### `assignments`
```sql
CREATE TABLE assignments (
    id             SERIAL PRIMARY KEY,
    employee_id    INT NOT NULL REFERENCES employees(id),
    project_id     INT NOT NULL REFERENCES projects(id),
    discipline_id  INT NOT NULL REFERENCES disciplines(id),
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    duration_days  INT GENERATED ALWAYS AS (end_date - start_date) STORED,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT end_after_start CHECK (end_date >= start_date)
);
```

---

## Key Indexes

```sql
-- Employee availability lookups
CREATE INDEX idx_employees_status ON employees(status);

-- Open position queries
CREATE INDEX idx_project_disciplines_project ON project_disciplines(project_id);
CREATE INDEX idx_project_disciplines_open
    ON project_disciplines(project_id, discipline_id)
    WHERE filled_count < required_count;

-- Assignment history per employee / project
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_project  ON assignments(project_id);
```

---

## EF Core Entity Classes (summary)

```csharp
// Models/Employee.cs
public class Employee {
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
    public ICollection<EmployeeDiscipline> EmployeeDisciplines { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}

// Models/Project.cs
public class Project {
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public ICollection<ProjectDiscipline> ProjectDisciplines { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}

// Models/ProjectDiscipline.cs
public class ProjectDiscipline {
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int DisciplineId { get; set; }
    public int RequiredCount { get; set; }
    public int FilledCount { get; set; }
    public int OpenCount => RequiredCount - FilledCount;  // computed property
    public Project Project { get; set; } = null!;
    public Discipline Discipline { get; set; } = null!;
}

// Models/Assignment.cs
public class Assignment {
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public int DisciplineId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public Employee Employee { get; set; } = null!;
    public Project Project { get; set; } = null!;
    public Discipline Discipline { get; set; } = null!;
}
```

---

## AppDbContext (EF Core)

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Discipline> Disciplines => Set<Discipline>();
    public DbSet<EmployeeDiscipline> EmployeeDisciplines => Set<EmployeeDiscipline>();
    public DbSet<ProjectDiscipline> ProjectDisciplines => Set<ProjectDiscipline>();
    public DbSet<Assignment> Assignments => Set<Assignment>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<EmployeeDiscipline>()
            .HasKey(ed => new { ed.EmployeeId, ed.DisciplineId });

        mb.Entity<Employee>()
            .Property(e => e.Status)
            .HasConversion<string>();

        mb.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<string>();
    }
}
```

---

## Migration Commands

```bash
# From pms-api/ folder

# Create initial migration
dotnet ef migrations add InitialCreate --project PMS.API

# Apply to database
dotnet ef database update --project PMS.API

# Rollback one migration
dotnet ef database update PreviousMigrationName --project PMS.API
```

---

## Seed Data (Development)

Seed in `AppDbContext.OnModelCreating` or a separate `DataSeeder` class:

```csharp
// Disciplines seed
mb.Entity<Discipline>().HasData(
    new Discipline { Id = 1, Name = "Civil Engineer" },
    new Discipline { Id = 2, Name = "Structural Designer" },
    new Discipline { Id = 3, Name = "Project Coordinator" },
    new Discipline { Id = 4, Name = "Site Supervisor" },
    new Discipline { Id = 5, Name = "Electrical Engineer" }
);
```
