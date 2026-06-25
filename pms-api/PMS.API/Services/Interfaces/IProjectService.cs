using PMS.API.DTOs.Project;

namespace PMS.API.Services.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetAllAsync(string? status, bool? open);
    Task<ProjectDto> GetByIdAsync(int id);
    Task<ProjectDto> CreateAsync(CreateProjectDto dto);
    Task<ProjectDto> UpdateAsync(int id, UpdateProjectDto dto);
    Task DeleteAsync(int id);
}
