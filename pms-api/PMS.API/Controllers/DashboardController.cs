using Microsoft.AspNetCore.Mvc;
using PMS.API.Services.Interfaces;

namespace PMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await dashboardService.GetSummaryAsync());
}
