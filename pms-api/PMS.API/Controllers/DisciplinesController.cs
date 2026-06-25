using Microsoft.AspNetCore.Mvc;
using PMS.API.DTOs.Discipline;
using PMS.API.Services.Interfaces;

namespace PMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DisciplinesController(IDisciplineService disciplineService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await disciplineService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) => Ok(await disciplineService.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDisciplineDto dto)
    {
        var created = await disciplineService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateDisciplineDto dto) =>
        Ok(await disciplineService.UpdateAsync(id, dto));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await disciplineService.DeleteAsync(id);
        return NoContent();
    }
}
