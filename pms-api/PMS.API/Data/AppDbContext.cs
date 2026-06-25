using Microsoft.EntityFrameworkCore;
using PMS.API.Models;

namespace PMS.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Discipline> Disciplines => Set<Discipline>();
    public DbSet<EmployeeDiscipline> EmployeeDisciplines => Set<EmployeeDiscipline>();
    public DbSet<ProjectDiscipline> ProjectDisciplines => Set<ProjectDiscipline>();
    public DbSet<Assignment> Assignments => Set<Assignment>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<EmployeeDiscipline>()
            .HasKey(ed => new { ed.EmployeeId, ed.DisciplineId });

        mb.Entity<Employee>()
            .Property(e => e.Status)
            .HasConversion<string>();

        mb.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<string>();

        mb.Entity<Employee>()
            .HasIndex(e => e.Email)
            .IsUnique();

        mb.Entity<Discipline>()
            .HasIndex(d => d.Name)
            .IsUnique();

        mb.Entity<ProjectDiscipline>()
            .HasIndex(pd => new { pd.ProjectId, pd.DisciplineId })
            .IsUnique();

        // Seed disciplines
        mb.Entity<Discipline>().HasData(
            new Discipline { Id = 1, Name = "Civil Engineer" },
            new Discipline { Id = 2, Name = "Structural Designer" },
            new Discipline { Id = 3, Name = "Project Coordinator" },
            new Discipline { Id = 4, Name = "Site Supervisor" },
            new Discipline { Id = 5, Name = "Electrical Engineer" }
        );
    }
}
