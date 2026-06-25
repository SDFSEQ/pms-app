namespace PMS.API.Models;

public class ProjectDiscipline
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int DisciplineId { get; set; }
    public int RequiredCount { get; set; } = 1;
    public int FilledCount { get; set; } = 0;

    public int OpenCount => RequiredCount - FilledCount;

    public Project Project { get; set; } = null!;
    public Discipline Discipline { get; set; } = null!;
}
