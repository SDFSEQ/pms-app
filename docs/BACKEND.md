# Backend Guide — ASP.NET Core 8

## Project Setup

```bash
# Create solution and project
dotnet new sln -n pms-api
dotnet new webapi -n PMS.API --no-https false
dotnet sln add PMS.API

# Add NuGet packages
dotnet add PMS.API package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add PMS.API package Microsoft.EntityFrameworkCore.Design
dotnet add PMS.API package AutoMapper.Extensions.Microsoft.DependencyInjection

# Test project
dotnet new xunit -n PMS.API.Tests
dotnet add PMS.API.Tests reference PMS.API
```

---

## Layer Responsibilities

```
HTTP Request
    ↓
Controller          — validates request shape, calls service, returns HTTP result
    ↓
Service             — business rules, orchestrates DB calls, throws domain exceptions
    ↓
AppDbContext (EF)   — translates LINQ queries to SQL, manages transactions
    ↓
PostgreSQL
```

Controllers never contain business logic. Services never return `IActionResult`.

---

## Program.cs Setup

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IDisciplineService, DisciplineService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// CORS — allow Angular dev server
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()));

// Global exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAngular");
app.UseExceptionHandler();
app.MapControllers();
app.Run();
```

---

## appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=pms_db;Username=postgres;Password=your_password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

---

## Controller Pattern

```csharp
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int? disciplineId)
    {
        var employees = await employeeService.GetAllAsync(status, disciplineId);
        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await employeeService.GetByIdAsync(id);
        return Ok(employee);  // service throws NotFoundException if not found
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        var created = await employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var updated = await employeeService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await employeeService.DeleteAsync(id);
        return NoContent();
    }
}
```

---

## Assignment Service (Core Business Logic)

```csharp
public class AssignmentService(AppDbContext db) : IAssignmentService
{
    public async Task<AssignmentDto> CreateAsync(CreateAssignmentDto dto)
    {
        // Load project discipline slot
        var slot = await db.ProjectDisciplines
            .Include(pd => pd.Project)
            .Include(pd => pd.Discipline)
            .FirstOrDefaultAsync(pd => pd.Id == dto.ProjectDisciplineId)
            ?? throw new NotFoundException("ProjectDiscipline", dto.ProjectDisciplineId);

        // Validate open slot
        if (slot.FilledCount >= slot.RequiredCount)
            throw new ConflictException("No open positions remain for this discipline slot.");

        // Load employee
        var employee = await db.Employees.FindAsync(dto.EmployeeId)
            ?? throw new NotFoundException("Employee", dto.EmployeeId);

        // Validate availability
        if (employee.Status == EmployeeStatus.Unavailable)
            throw new ConflictException($"Employee {employee.FullName} is already assigned to a project.");

        // Validate employee holds required discipline
        var hasDiscipline = await db.EmployeeDisciplines.AnyAsync(ed =>
            ed.EmployeeId == dto.EmployeeId && ed.DisciplineId == slot.DisciplineId);
        if (!hasDiscipline)
            throw new ConflictException("Employee does not have the required discipline for this slot.");

        // Create assignment in a transaction
        await using var tx = await db.Database.BeginTransactionAsync();

        var assignment = new Assignment
        {
            EmployeeId = dto.EmployeeId,
            ProjectId = slot.ProjectId,
            DisciplineId = slot.DisciplineId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        db.Assignments.Add(assignment);
        employee.Status = EmployeeStatus.Unavailable;
        slot.FilledCount++;

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return MapToDto(assignment, employee, slot);
    }

    public async Task DeleteAsync(int id)
    {
        var assignment = await db.Assignments.FindAsync(id)
            ?? throw new NotFoundException("Assignment", id);

        var employee = await db.Employees.FindAsync(assignment.EmployeeId)!;
        var slot = await db.ProjectDisciplines
            .FirstAsync(pd => pd.ProjectId == assignment.ProjectId
                           && pd.DisciplineId == assignment.DisciplineId);

        await using var tx = await db.Database.BeginTransactionAsync();

        db.Assignments.Remove(assignment);
        employee!.Status = EmployeeStatus.Available;
        slot.FilledCount = Math.Max(0, slot.FilledCount - 1);

        await db.SaveChangesAsync();
        await tx.CommitAsync();
    }
}
```

---

## Global Exception Handler

```csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            NotFoundException  => (StatusCodes.Status404NotFound,  "Not Found"),
            ConflictException  => (StatusCodes.Status409Conflict,  "Conflict"),
            _                  => (StatusCodes.Status500InternalServerError, "Server Error")
        };

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title  = title,
            Detail = exception.Message
        }, ct);

        return true;
    }
}
```

---

## Dashboard Query (Service)

```csharp
public async Task<DashboardSummaryDto> GetSummaryAsync()
{
    var openSlots = await db.ProjectDisciplines
        .Where(pd => pd.FilledCount < pd.RequiredCount)
        .Include(pd => pd.Discipline)
        .ToListAsync();

    var availableEmployees = await db.Employees
        .Where(e => e.Status == EmployeeStatus.Available)
        .Include(e => e.EmployeeDisciplines)
        .ThenInclude(ed => ed.Discipline)
        .ToListAsync();

    return new DashboardSummaryDto
    {
        TotalProjectsWithOpenPositions = openSlots.Select(s => s.ProjectId).Distinct().Count(),
        TotalOpenPositions = openSlots.Sum(s => s.RequiredCount - s.FilledCount),
        TotalAvailableEmployees = availableEmployees.Count,
        OpenPositionsByDiscipline = openSlots
            .GroupBy(s => new { s.DisciplineId, s.Discipline.Name })
            .Select(g => new DisciplineCountDto
            {
                DisciplineId   = g.Key.DisciplineId,
                DisciplineName = g.Key.Name,
                Count          = g.Sum(s => s.RequiredCount - s.FilledCount)
            }).ToList(),
        AvailableEmployeesByDiscipline = availableEmployees
            .SelectMany(e => e.EmployeeDisciplines)
            .GroupBy(ed => new { ed.DisciplineId, ed.Discipline.Name })
            .Select(g => new DisciplineCountDto
            {
                DisciplineId   = g.Key.DisciplineId,
                DisciplineName = g.Key.Name,
                Count          = g.Count()
            }).ToList()
    };
}
```

---

## Running the API

```bash
# From pms-api/PMS.API/
dotnet run

# API: http://localhost:5000/api
# Swagger: http://localhost:5000/swagger
```
