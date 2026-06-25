namespace PMS.API.DTOs.Project;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = "";
    public int TotalRequired { get; set; }
    public int TotalFilled { get; set; }
    public int TotalOpen { get; set; }
    public List<ProjectDisciplineDto> DisciplineRequirements { get; set; } = [];
}

public class ProjectDisciplineDto
{
    public int Id { get; set; }
    public int DisciplineId { get; set; }
    public string DisciplineName { get; set; } = "";
    public int RequiredCount { get; set; }
    public int FilledCount { get; set; }
    public int OpenCount { get; set; }
}

public class CreateProjectDto
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public List<DisciplineRequirementDto> DisciplineRequirements { get; set; } = [];
}

public class UpdateProjectDto
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = "Active";
    public List<DisciplineRequirementDto> DisciplineRequirements { get; set; } = [];
}

public class DisciplineRequirementDto
{
    public int DisciplineId { get; set; }
    public int RequiredCount { get; set; }
}
