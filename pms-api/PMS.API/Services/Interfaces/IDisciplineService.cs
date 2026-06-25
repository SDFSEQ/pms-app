using PMS.API.DTOs.Discipline;

namespace PMS.API.Services.Interfaces;

public interface IDisciplineService
{
    Task<List<DisciplineDto>> GetAllAsync();
    Task<DisciplineDto> GetByIdAsync(int id);
    Task<DisciplineDto> CreateAsync(CreateDisciplineDto dto);
    Task<DisciplineDto> UpdateAsync(int id, CreateDisciplineDto dto);
    Task DeleteAsync(int id);
}
