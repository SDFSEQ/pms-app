using Microsoft.EntityFrameworkCore;
using PMS.API.Data;
using PMS.API.DTOs.Discipline;
using PMS.API.Exceptions;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class DisciplineService(AppDbContext db) : IDisciplineService
{
    public async Task<List<DisciplineDto>> GetAllAsync() =>
        await db.Disciplines
            .OrderBy(d => d.Name)
            .Select(d => ToDto(d))
            .ToListAsync();

    public async Task<DisciplineDto> GetByIdAsync(int id)
    {
        var d = await db.Disciplines.FindAsync(id)
            ?? throw new NotFoundException("Discipline", id);
        return ToDto(d);
    }

    public async Task<DisciplineDto> CreateAsync(CreateDisciplineDto dto)
    {
        if (await db.Disciplines.AnyAsync(d => d.Name == dto.Name))
            throw new ConflictException($"Discipline '{dto.Name}' already exists.");

        var discipline = new Discipline { Name = dto.Name, Description = dto.Description };
        db.Disciplines.Add(discipline);
        await db.SaveChangesAsync();
        return ToDto(discipline);
    }

    public async Task<DisciplineDto> UpdateAsync(int id, CreateDisciplineDto dto)
    {
        var discipline = await db.Disciplines.FindAsync(id)
            ?? throw new NotFoundException("Discipline", id);

        if (await db.Disciplines.AnyAsync(d => d.Name == dto.Name && d.Id != id))
            throw new ConflictException($"Discipline '{dto.Name}' already exists.");

        discipline.Name = dto.Name;
        discipline.Description = dto.Description;
        discipline.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToDto(discipline);
    }

    public async Task DeleteAsync(int id)
    {
        var discipline = await db.Disciplines.FindAsync(id)
            ?? throw new NotFoundException("Discipline", id);

        bool inUse = await db.EmployeeDisciplines.AnyAsync(ed => ed.DisciplineId == id)
                  || await db.ProjectDisciplines.AnyAsync(pd => pd.DisciplineId == id);
        if (inUse)
            throw new ConflictException("Discipline is in use and cannot be deleted.");

        db.Disciplines.Remove(discipline);
        await db.SaveChangesAsync();
    }

    private static DisciplineDto ToDto(Discipline d) =>
        new() { Id = d.Id, Name = d.Name, Description = d.Description };
}
