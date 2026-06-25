# Project Management System — Architecture Overview

## Stack

| Layer    | Technology              | Version     |
|----------|-------------------------|-------------|
| Frontend | Angular + PrimeNG       | 20.x / 20.x |
| Backend  | ASP.NET Core Web API    | .NET 8      |
| Database | PostgreSQL              | 17.x        |
| ORM      | Entity Framework Core   | 8.x         |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Admin SPA)                   │
│                                                          │
│   Angular 20 + PrimeNG 20                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │Dashboard │  │Employees │  │Projects  │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│   ┌──────────┐  ┌──────────┐                            │
│   │Disciplines│  │Assignments│                          │
│   └──────────┘  └──────────┘                            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/JSON (REST API)
                       │ CORS enabled
┌──────────────────────▼──────────────────────────────────┐
│              ASP.NET Core 8 Web API                      │
│                                                          │
│   Controllers → Services → Repositories → EF Core       │
│                                                          │
│   /api/dashboard    /api/employees    /api/projects      │
│   /api/disciplines  /api/assignments                     │
└──────────────────────┬──────────────────────────────────┘
                       │ EF Core 8 (Npgsql)
┌──────────────────────▼──────────────────────────────────┐
│                   PostgreSQL 17                          │
│                                                          │
│   employees  disciplines  projects                       │
│   employee_disciplines    project_disciplines            │
│   assignments                                            │
└─────────────────────────────────────────────────────────┘
```

---

## Core Domain Entities

### Employee
Represents a staff member available for project assignment.
- Has one or more **Disciplines**
- Can be **Available** or **Unavailable** (assigned to a project)
- An assignment records the duration (start/end date or number of days)

### Discipline
A skill category (e.g., Civil Engineer, Structural Designer, Project Coordinator).
- Shared lookup table referenced by both Employees and Projects
- Employees can hold multiple disciplines
- Projects require a specific headcount per discipline

### Project
A work engagement that requires staffing from specific disciplines.
- Has required headcount per discipline (`project_disciplines`)
- Tracks filled vs. required positions
- Drives the "open positions" dashboard metric

### Assignment
Links one Employee to one Project for a specific Discipline and duration.
- Created during "Assign by Project" or "Assign by Employee" workflows
- Duration stored as `start_date + end_date` (duration_days derived)
- Creating an assignment marks the employee Unavailable and decrements the open slot

---

## Assignment Workflows

### Assign by Project
1. Admin opens a Project's open positions
2. Selects a Discipline slot that is unfilled
3. System lists all **available** employees who hold that Discipline
4. Admin picks an employee and sets start/end date
5. System creates Assignment, marks Employee unavailable, decrements open slot

### Assign by Employee
1. Admin searches/selects an Employee
2. System lists all Projects with **open slots** matching any of the Employee's Disciplines
3. Admin picks a Project + Discipline and sets start/end date
4. System creates Assignment, marks Employee unavailable, decrements open slot

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Database | PostgreSQL | Open source, robust, full ACID, excellent EF Core support via Npgsql |
| ORM | EF Core 8 with Migrations | Code-first schema management, LINQ queries |
| API style | REST JSON | Simple, stateless, easy to consume from Angular HttpClient |
| UI library | PrimeNG 20 | Rich data table, form, dialog, and chart components matching app needs |
| State mgmt | Angular Services + Signals | Lightweight; no need for NgRx at this scale |
| Auth | Out of scope (v1) | Single-admin app; add JWT/role auth in v2 if needed |
