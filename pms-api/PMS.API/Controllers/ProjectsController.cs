using Microsoft.AspNetCore.Mvc;
using PMS.API.DTOs.Project;
using PMS.API.Services.Interfaces;

namespace PMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] bool? open) =>
        Ok(await projectService.GetAllAsync(status, open));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) => Ok(await projectService.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var created = await projectService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto) =>
        Ok(await projectService.UpdateAsync(id, dto));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await projectService.DeleteAsync(id);
        return NoContent();
    }
}
