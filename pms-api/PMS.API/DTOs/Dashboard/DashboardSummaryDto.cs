namespace PMS.API.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int TotalProjectsWithOpenPositions { get; set; }
    public int TotalOpenPositions { get; set; }
    public int TotalAvailableEmployees { get; set; }
    public List<DisciplineCountDto> OpenPositionsByDiscipline { get; set; } = [];
    public List<DisciplineCountDto> AvailableEmployeesByDiscipline { get; set; } = [];
}

public class DisciplineCountDto
{
    public int DisciplineId { get; set; }
    public string DisciplineName { get; set; } = "";
    public int Count { get; set; }
}
