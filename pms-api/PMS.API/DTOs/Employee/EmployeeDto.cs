using PMS.API.DTOs.Discipline;

namespace PMS.API.DTOs.Employee;

public class EmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string Status { get; set; } = "";
    public List<DisciplineDto> Disciplines { get; set; } = [];
    public List<EmployeeAssignmentDto> Assignments { get; set; } = [];
}

public class EmployeeAssignmentDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = "";
    public string DisciplineName { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int DurationDays { get; set; }
}

public class CreateEmployeeDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public List<int> DisciplineIds { get; set; } = [];
}

public class UpdateEmployeeDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public List<int> DisciplineIds { get; set; } = [];
}
