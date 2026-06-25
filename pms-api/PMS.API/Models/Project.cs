namespace PMS.API.Models;

public enum ProjectStatus { Active, Completed, OnHold }

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectDiscipline> ProjectDisciplines { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}
