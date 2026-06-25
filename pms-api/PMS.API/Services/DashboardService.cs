using Microsoft.EntityFrameworkCore;
using PMS.API.Data;
using PMS.API.DTOs.Dashboard;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class DashboardService(AppDbContext db) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var openSlots = await db.ProjectDisciplines
            .Where(pd => pd.FilledCount < pd.RequiredCount)
            .Include(pd => pd.Discipline)
            .ToListAsync();

        var availableEmployees = await db.Employees
            .Where(e => e.Status == EmployeeStatus.Available)
            .Include(e => e.EmployeeDisciplines).ThenInclude(ed => ed.Discipline)
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
                    DisciplineId = g.Key.DisciplineId,
                    DisciplineName = g.Key.Name,
                    Count = g.Sum(s => s.RequiredCount - s.FilledCount)
                })
                .OrderByDescending(d => d.Count)
                .ToList(),
            AvailableEmployeesByDiscipline = availableEmployees
                .SelectMany(e => e.EmployeeDisciplines)
                .GroupBy(ed => new { ed.DisciplineId, ed.Discipline.Name })
                .Select(g => new DisciplineCountDto
                {
                    DisciplineId = g.Key.DisciplineId,
                    DisciplineName = g.Key.Name,
                    Count = g.Count()
                })
                .OrderByDescending(d => d.Count)
                .ToList()
        };
    }
}
