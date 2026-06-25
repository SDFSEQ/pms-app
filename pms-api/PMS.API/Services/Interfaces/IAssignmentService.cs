using PMS.API.DTOs.Assignment;

namespace PMS.API.Services.Interfaces;

public interface IAssignmentService
{
    Task<List<AssignmentDto>> GetAllAsync(int? employeeId, int? projectId, int? disciplineId);
    Task<List<EligibleEmployeeDto>> GetEligibleEmployeesAsync(int projectDisciplineId);
    Task<List<EligibleProjectDto>> GetEligibleProjectsAsync(int employeeId);
    Task<AssignmentDto> CreateAsync(CreateAssignmentDto dto);
    Task DeleteAsync(int id);
}
