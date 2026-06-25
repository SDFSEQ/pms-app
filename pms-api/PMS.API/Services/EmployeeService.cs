using Microsoft.EntityFrameworkCore;
using PMS.API.Data;
using PMS.API.DTOs.Discipline;
using PMS.API.DTOs.Employee;
using PMS.API.Exceptions;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class EmployeeService(AppDbContext db) : IEmployeeService
{
    public async Task<List<EmployeeDto>> GetAllAsync(string? status, int? disciplineId)
    {
        var query = db.Employees
            .Include(e => e.EmployeeDisciplines).ThenInclude(ed => ed.Discipline)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) &&
            Enum.TryParse<EmployeeStatus>(status, true, out var parsed))
            query = query.Where(e => e.Status == parsed);

        if (disciplineId.HasValue)
            query = query.Where(e => e.EmployeeDisciplines.Any(ed => ed.DisciplineId == disciplineId));

        return await query
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .Select(e => ToListDto(e))
            .ToListAsync();
    }

    public async Task<EmployeeDto> GetByIdAsync(int id)
    {
        var employee = await db.Employees
            .Include(e => e.EmployeeDisciplines).ThenInclude(ed => ed.Discipline)
            .Include(e => e.Assignments).ThenInclude(a => a.Project)
            .Include(e => e.Assignments).ThenInclude(a => a.Discipline)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException("Employee", id);

        return ToDetailDto(employee);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        if (await db.Employees.AnyAsync(e => e.Email == dto.Email))
            throw new ConflictException($"An employee with email '{dto.Email}' already exists.");

        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone
        };

        foreach (var dId in dto.DisciplineIds.Distinct())
        {
            if (!await db.Disciplines.AnyAsync(d => d.Id == dId))
                throw new NotFoundException("Discipline", dId);
            employee.EmployeeDisciplines.Add(new EmployeeDiscipline { DisciplineId = dId });
        }

        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        return await GetByIdAsync(employee.Id);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await db.Employees
            .Include(e => e.EmployeeDisciplines)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException("Employee", id);

        if (await db.Employees.AnyAsync(e => e.Email == dto.Email && e.Id != id))
            throw new ConflictException($"An employee with email '{dto.Email}' already exists.");

        employee.FirstName = dto.FirstName;
        employee.LastName = dto.LastName;
        employee.Email = dto.Email;
        employee.Phone = dto.Phone;
        employee.UpdatedAt = DateTime.UtcNow;

        db.EmployeeDisciplines.RemoveRange(employee.EmployeeDisciplines);
        foreach (var dId in dto.DisciplineIds.Distinct())
        {
            if (!await db.Disciplines.AnyAsync(d => d.Id == dId))
                throw new NotFoundException("Discipline", dId);
            employee.EmployeeDisciplines.Add(new EmployeeDiscipline { EmployeeId = id, DisciplineId = dId });
        }

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var employee = await db.Employees.FindAsync(id)
            ?? throw new NotFoundException("Employee", id);

        var assignments = await db.Assignments
            .Include(a => a.Project)
            .Where(a => a.EmployeeId == id)
            .ToListAsync();

        if (assignments.Any())
        {
            var projectNames = string.Join(", ", assignments
                .Select(a => a.Project.Name)
                .Distinct());
            throw new ConflictException(
                $"Cannot delete \"{employee.FirstName} {employee.LastName}\" — they have " +
                $"{assignments.Count} active assignment(s) on: {projectNames}. " +
                "Please remove all assignments first, then try again.");
        }

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();
    }

    private static EmployeeDto ToListDto(Employee e) => new()
    {
        Id = e.Id,
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        Phone = e.Phone,
        Status = e.Status.ToString(),
        Disciplines = e.EmployeeDisciplines
            .Select(ed => new DisciplineDto { Id = ed.DisciplineId, Name = ed.Discipline.Name })
            .ToList()
    };

    private static EmployeeDto ToDetailDto(Employee e) => new()
    {
        Id = e.Id,
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        Phone = e.Phone,
        Status = e.Status.ToString(),
        Disciplines = e.EmployeeDisciplines
            .Select(ed => new DisciplineDto { Id = ed.DisciplineId, Name = ed.Discipline.Name })
            .ToList(),
        Assignments = e.Assignments
            .OrderByDescending(a => a.StartDate)
            .Select(a => new EmployeeAssignmentDto
            {
                Id = a.Id,
                ProjectId = a.ProjectId,
                ProjectName = a.Project.Name,
                DisciplineName = a.Discipline.Name,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                DurationDays = a.DurationDays
            }).ToList()
    };
}
