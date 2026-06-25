namespace PMS.API.Models;

public class Discipline
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<EmployeeDiscipline> EmployeeDisciplines { get; set; } = [];
    public ICollection<ProjectDiscipline> ProjectDisciplines { get; set; } = [];
}
