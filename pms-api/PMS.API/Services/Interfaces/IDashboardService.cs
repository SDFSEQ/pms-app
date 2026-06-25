using PMS.API.DTOs.Dashboard;

namespace PMS.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}
