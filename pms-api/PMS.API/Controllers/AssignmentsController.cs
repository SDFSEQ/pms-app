using Microsoft.AspNetCore.Mvc;
using PMS.API.DTOs.Assignment;
using PMS.API.Services.Interfaces;

namespace PMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController(IAssignmentService assignmentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? employeeId,
        [FromQuery] int? projectId,
        [FromQuery] int? disciplineId) =>
        Ok(await assignmentService.GetAllAsync(employeeId, projectId, disciplineId));

    [HttpGet("eligible-employees/{projectDisciplineId:int}")]
    public async Task<IActionResult> GetEligibleEmployees(int projectDisciplineId) =>
        Ok(await assignmentService.GetEligibleEmployeesAsync(projectDisciplineId));

    [HttpGet("eligible-projects/{employeeId:int}")]
    public async Task<IActionResult> GetEligibleProjects(int employeeId) =>
        Ok(await assignmentService.GetEligibleProjectsAsync(employeeId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        var created = await assignmentService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await assignmentService.DeleteAsync(id);
        return NoContent();
    }
}
