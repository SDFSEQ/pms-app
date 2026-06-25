namespace PMS.API.Models;

public enum EmployeeStatus { Available, Unavailable }

public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Available;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{FirstName} {LastName}";

    public ICollection<EmployeeDiscipline> EmployeeDisciplines { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}
