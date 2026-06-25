namespace PMS.API.DTOs.Assignment;

public class AssignmentDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = "";
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = "";
    public int DisciplineId { get; set; }
    public string DisciplineName { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int DurationDays { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAssignmentDto
{
    public int EmployeeId { get; set; }
    public int ProjectDisciplineId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}

public class EligibleEmployeeDto
{
    public int EmployeeId { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string DisciplineName { get; set; } = "";
}

public class EligibleProjectDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = "";
    public int ProjectDisciplineId { get; set; }
    public int DisciplineId { get; set; }
    public string DisciplineName { get; set; } = "";
    public int OpenCount { get; set; }
}
