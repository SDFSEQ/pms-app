using Microsoft.EntityFrameworkCore;
using PMS.API.Data;
using PMS.API.DTOs.Assignment;
using PMS.API.Exceptions;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class AssignmentService(AppDbContext db) : IAssignmentService
{
    public async Task<List<AssignmentDto>> GetAllAsync(int? employeeId, int? projectId, int? disciplineId)
    {
        var query = db.Assignments
            .Include(a => a.Employee)
            .Include(a => a.Project)
            .Include(a => a.Discipline)
            .AsQueryable();

        if (employeeId.HasValue) query = query.Where(a => a.EmployeeId == employeeId);
        if (projectId.HasValue)  query = query.Where(a => a.ProjectId == projectId);
        if (disciplineId.HasValue) query = query.Where(a => a.DisciplineId == disciplineId);

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => ToDto(a))
            .ToListAsync();
    }

    public async Task<List<EligibleEmployeeDto>> GetEligibleEmployeesAsync(int projectDisciplineId)
    {
        var slot = await db.ProjectDisciplines
            .Include(pd => pd.Discipline)
            .FirstOrDefaultAsync(pd => pd.Id == projectDisciplineId)
            ?? throw new NotFoundException("ProjectDiscipline", projectDisciplineId);

        return await db.Employees
            .Where(e => e.Status == EmployeeStatus.Available &&
                        e.EmployeeDisciplines.Any(ed => ed.DisciplineId == slot.DisciplineId))
            .OrderBy(e => e.LastName)
            .Select(e => new EligibleEmployeeDto
            {
                EmployeeId = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                DisciplineName = slot.Discipline.Name
            })
            .ToListAsync();
    }

    public async Task<List<EligibleProjectDto>> GetEligibleProjectsAsync(int employeeId)
    {
        var employee = await db.Employees
            .Include(e => e.EmployeeDisciplines)
            .FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new NotFoundException("Employee", employeeId);

        var disciplineIds = employee.EmployeeDisciplines.Select(ed => ed.DisciplineId).ToList();

        return await db.ProjectDisciplines
            .Include(pd => pd.Project)
            .Include(pd => pd.Discipline)
            .Where(pd => disciplineIds.Contains(pd.DisciplineId) &&
                         pd.FilledCount < pd.RequiredCount &&
                         pd.Project.Status == ProjectStatus.Active)
            .OrderBy(pd => pd.Project.Name)
            .Select(pd => new EligibleProjectDto
            {
                ProjectId = pd.ProjectId,
                ProjectName = pd.Project.Name,
                ProjectDisciplineId = pd.Id,
                DisciplineId = pd.DisciplineId,
                DisciplineName = pd.Discipline.Name,
                OpenCount = pd.RequiredCount - pd.FilledCount
            })
            .ToListAsync();
    }

    public async Task<AssignmentDto> CreateAsync(CreateAssignmentDto dto)
    {
        if (dto.EndDate < dto.StartDate)
            throw new ConflictException("End date must be on or after start date.");

        var slot = await db.ProjectDisciplines
            .Include(pd => pd.Project)
            .Include(pd => pd.Discipline)
            .FirstOrDefaultAsync(pd => pd.Id == dto.ProjectDisciplineId)
            ?? throw new NotFoundException("ProjectDiscipline", dto.ProjectDisciplineId);

        if (slot.FilledCount >= slot.RequiredCount)
            throw new ConflictException("No open positions remain for this discipline slot.");

        var employee = await db.Employees.FindAsync(dto.EmployeeId)
            ?? throw new NotFoundException("Employee", dto.EmployeeId);

        if (employee.Status == EmployeeStatus.Unavailable)
            throw new ConflictException($"Employee {employee.FullName} is already assigned to a project.");

        var hasDisc = await db.EmployeeDisciplines.AnyAsync(ed =>
            ed.EmployeeId == dto.EmployeeId && ed.DisciplineId == slot.DisciplineId);
        if (!hasDisc)
            throw new ConflictException("Employee does not hold the required discipline for this slot.");

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
        employee.UpdatedAt = DateTime.UtcNow;
        slot.FilledCount++;

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return new AssignmentDto
        {
            Id = assignment.Id,
            EmployeeId = employee.Id,
            EmployeeName = employee.FullName,
            ProjectId = slot.ProjectId,
            ProjectName = slot.Project.Name,
            DisciplineId = slot.DisciplineId,
            DisciplineName = slot.Discipline.Name,
            StartDate = assignment.StartDate,
            EndDate = assignment.EndDate,
            DurationDays = assignment.DurationDays,
            CreatedAt = assignment.CreatedAt
        };
    }

    public async Task DeleteAsync(int id)
    {
        var assignment = await db.Assignments
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Assignment", id);

        var slot = await db.ProjectDisciplines
            .FirstAsync(pd => pd.ProjectId == assignment.ProjectId &&
                              pd.DisciplineId == assignment.DisciplineId);

        await using var tx = await db.Database.BeginTransactionAsync();

        db.Assignments.Remove(assignment);
        assignment.Employee.Status = EmployeeStatus.Available;
        assignment.Employee.UpdatedAt = DateTime.UtcNow;
        slot.FilledCount = Math.Max(0, slot.FilledCount - 1);

        await db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    private static AssignmentDto ToDto(Assignment a) => new()
    {
        Id = a.Id,
        EmployeeId = a.EmployeeId,
        EmployeeName = a.Employee.FullName,
        ProjectId = a.ProjectId,
        ProjectName = a.Project.Name,
        DisciplineId = a.DisciplineId,
        DisciplineName = a.Discipline.Name,
        StartDate = a.StartDate,
        EndDate = a.EndDate,
        DurationDays = a.DurationDays,
        CreatedAt = a.CreatedAt
    };
}
