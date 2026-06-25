namespace PMS.API.Models;

public class Assignment
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public int DisciplineId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int DurationDays => EndDate.DayNumber - StartDate.DayNumber;

    public Employee Employee { get; set; } = null!;
    public Project Project { get; set; } = null!;
    public Discipline Discipline { get; set; } = null!;
}
