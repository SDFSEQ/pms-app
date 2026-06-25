namespace PMS.API.Models;

public class EmployeeDiscipline
{
    public int EmployeeId { get; set; }
    public int DisciplineId { get; set; }

    public Employee Employee { get; set; } = null!;
    public Discipline Discipline { get; set; } = null!;
}
