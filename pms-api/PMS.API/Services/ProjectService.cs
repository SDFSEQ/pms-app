using Microsoft.EntityFrameworkCore;
using PMS.API.Data;
using PMS.API.DTOs.Project;
using PMS.API.Exceptions;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<List<ProjectDto>> GetAllAsync(string? status, bool? open)
    {
        var query = db.Projects
            .Include(p => p.ProjectDisciplines).ThenInclude(pd => pd.Discipline)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) &&
            Enum.TryParse<ProjectStatus>(status, true, out var parsed))
            query = query.Where(p => p.Status == parsed);

        if (open == true)
            query = query.Where(p => p.ProjectDisciplines.Any(pd => pd.FilledCount < pd.RequiredCount));

        return await query
            .OrderBy(p => p.Name)
            .Select(p => ToDto(p))
            .ToListAsync();
    }

    public async Task<ProjectDto> GetByIdAsync(int id)
    {
        var project = await db.Projects
            .Include(p => p.ProjectDisciplines).ThenInclude(pd => pd.Discipline)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("Project", id);

        return ToDto(project);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        foreach (var req in dto.DisciplineRequirements)
        {
            if (!await db.Disciplines.AnyAsync(d => d.Id == req.DisciplineId))
                throw new NotFoundException("Discipline", req.DisciplineId);

            project.ProjectDisciplines.Add(new ProjectDiscipline
            {
                DisciplineId = req.DisciplineId,
                RequiredCount = req.RequiredCount
            });
        }

        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return await GetByIdAsync(project.Id);
    }

    public async Task<ProjectDto> UpdateAsync(int id, UpdateProjectDto dto)
    {
        var project = await db.Projects
            .Include(p => p.ProjectDisciplines)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("Project", id);

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.UpdatedAt = DateTime.UtcNow;

        if (Enum.TryParse<ProjectStatus>(dto.Status, true, out var status))
            project.Status = status;

        // Update discipline requirements (preserve FilledCount)
        var existingSlots = project.ProjectDisciplines.ToDictionary(pd => pd.DisciplineId);

        var newDisciplineIds = dto.DisciplineRequirements.Select(r => r.DisciplineId).ToHashSet();
        var toRemove = project.ProjectDisciplines.Where(pd => !newDisciplineIds.Contains(pd.DisciplineId)).ToList();

        foreach (var remove in toRemove)
        {
            if (remove.FilledCount > 0)
                throw new ConflictException($"Cannot remove discipline that has active assignments.");
            project.ProjectDisciplines.Remove(remove);
        }

        foreach (var req in dto.DisciplineRequirements)
        {
            if (existingSlots.TryGetValue(req.DisciplineId, out var slot))
            {
                if (req.RequiredCount < slot.FilledCount)
                    throw new ConflictException("Required count cannot be less than already filled positions.");
                slot.RequiredCount = req.RequiredCount;
            }
            else
            {
                if (!await db.Disciplines.AnyAsync(d => d.Id == req.DisciplineId))
                    throw new NotFoundException("Discipline", req.DisciplineId);

                project.ProjectDisciplines.Add(new ProjectDiscipline
                {
                    DisciplineId = req.DisciplineId,
                    RequiredCount = req.RequiredCount
                });
            }
        }

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var project = await db.Projects.FindAsync(id)
            ?? throw new NotFoundException("Project", id);

        if (await db.Assignments.AnyAsync(a => a.ProjectId == id))
            throw new ConflictException("Project has assignment history and cannot be deleted.");

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
    }

    private static ProjectDto ToDto(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        Status = p.Status.ToString(),
        TotalRequired = p.ProjectDisciplines.Sum(pd => pd.RequiredCount),
        TotalFilled = p.ProjectDisciplines.Sum(pd => pd.FilledCount),
        TotalOpen = p.ProjectDisciplines.Sum(pd => pd.OpenCount),
        DisciplineRequirements = p.ProjectDisciplines
            .Select(pd => new ProjectDisciplineDto
            {
                Id = pd.Id,
                DisciplineId = pd.DisciplineId,
                DisciplineName = pd.Discipline.Name,
                RequiredCount = pd.RequiredCount,
                FilledCount = pd.FilledCount,
                OpenCount = pd.OpenCount
            }).ToList()
    };
}
