# REST API Reference — ASP.NET Core 8

Base URL: `http://localhost:5000/api`

All responses are JSON. All list endpoints return arrays. Error responses use RFC 7807 Problem Details format.

---

## Dashboard

### `GET /api/dashboard`
Returns the main dashboard summary.

**Response 200**
```json
{
  "totalProjectsWithOpenPositions": 5,
  "totalOpenPositions": 12,
  "totalAvailableEmployees": 8,
  "openPositionsByDiscipline": [
    { "disciplineId": 1, "disciplineName": "Civil Engineer", "openCount": 4 },
    { "disciplineId": 2, "disciplineName": "Structural Designer", "openCount": 3 }
  ],
  "availableEmployeesByDiscipline": [
    { "disciplineId": 1, "disciplineName": "Civil Engineer", "availableCount": 3 },
    { "disciplineId": 2, "disciplineName": "Structural Designer", "availableCount": 2 }
  ]
}
```

---

## Disciplines

### `GET /api/disciplines`
Returns all disciplines.

**Response 200**
```json
[
  { "id": 1, "name": "Civil Engineer", "description": "..." },
  { "id": 2, "name": "Structural Designer", "description": "..." }
]
```

### `GET /api/disciplines/{id}`
Returns a single discipline.

### `POST /api/disciplines`
Creates a new discipline.

**Request body**
```json
{ "name": "Electrical Engineer", "description": "Optional description" }
```

**Response 201** — created discipline object

### `PUT /api/disciplines/{id}`
Updates a discipline.

### `DELETE /api/disciplines/{id}`
Deletes a discipline. Returns **409 Conflict** if discipline is in use.

---

## Employees

### `GET /api/employees`
Returns all employees with their disciplines.

**Query params**
| Param       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| status      | string | Filter: `available` or `unavailable` |
| disciplineId| int    | Filter by discipline                 |

**Response 200**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+1-555-0100",
    "status": "available",
    "disciplines": [
      { "id": 1, "name": "Civil Engineer" }
    ]
  }
]
```

### `GET /api/employees/{id}`
Returns a single employee with full details including assignment history.

**Response 200**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "+1-555-0100",
  "status": "available",
  "disciplines": [ ... ],
  "assignments": [
    {
      "id": 10,
      "projectId": 3,
      "projectName": "Bridge Renewal",
      "disciplineName": "Civil Engineer",
      "startDate": "2026-01-15",
      "endDate": "2026-06-30",
      "durationDays": 165
    }
  ]
}
```

### `POST /api/employees`
Creates a new employee.

**Request body**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-0200",
  "disciplineIds": [1, 3]
}
```

**Response 201** — created employee object
**Response 409** — email already exists

### `PUT /api/employees/{id}`
Updates employee details and disciplines.

**Request body** — same shape as POST

### `DELETE /api/employees/{id}`
Soft-deletes or hard-deletes an employee. Returns **409 Conflict** if employee has active assignments.

---

## Projects

### `GET /api/projects`
Returns all projects with discipline requirements.

**Query params**
| Param  | Type   | Description                              |
|--------|--------|------------------------------------------|
| status | string | Filter: `active`, `completed`, `on_hold` |
| open   | bool   | If `true`, return only projects with open positions |

**Response 200**
```json
[
  {
    "id": 1,
    "name": "Highway Expansion Phase 2",
    "description": "...",
    "startDate": "2026-03-01",
    "endDate": "2027-06-30",
    "status": "active",
    "totalRequired": 8,
    "totalFilled": 5,
    "totalOpen": 3,
    "disciplineRequirements": [
      {
        "id": 10,
        "disciplineId": 1,
        "disciplineName": "Civil Engineer",
        "requiredCount": 3,
        "filledCount": 2,
        "openCount": 1
      }
    ]
  }
]
```

### `GET /api/projects/{id}`
Returns a single project with full details including current assignments.

### `POST /api/projects`
Creates a new project.

**Request body**
```json
{
  "name": "Highway Expansion Phase 2",
  "description": "...",
  "startDate": "2026-03-01",
  "endDate": "2027-06-30",
  "disciplineRequirements": [
    { "disciplineId": 1, "requiredCount": 3 },
    { "disciplineId": 2, "requiredCount": 2 }
  ]
}
```

**Response 201** — created project object

### `PUT /api/projects/{id}`
Updates project details and discipline requirements.

### `DELETE /api/projects/{id}`
Deletes a project. Returns **409** if project has active assignments.

---

## Assignments

### `GET /api/assignments`
Returns all assignments.

**Query params**: `employeeId`, `projectId`, `disciplineId`

### `GET /api/assignments/eligible-employees/{projectDisciplineId}`
Returns available employees eligible for a specific project discipline slot.

**Response 200**
```json
[
  {
    "employeeId": 5,
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@example.com",
    "disciplineName": "Civil Engineer"
  }
]
```

### `GET /api/assignments/eligible-projects/{employeeId}`
Returns projects with open slots matching the employee's disciplines.

**Response 200**
```json
[
  {
    "projectId": 1,
    "projectName": "Highway Expansion Phase 2",
    "projectDisciplineId": 10,
    "disciplineId": 1,
    "disciplineName": "Civil Engineer",
    "openCount": 1
  }
]
```

### `POST /api/assignments`
Creates an assignment (works for both assign-by-project and assign-by-employee flows).

**Request body**
```json
{
  "employeeId": 5,
  "projectDisciplineId": 10,
  "startDate": "2026-07-01",
  "endDate": "2026-12-31"
}
```

**Side effects**:
1. Sets `employees.status = 'unavailable'`
2. Increments `project_disciplines.filled_count`

**Response 201** — created assignment object
**Response 409** — employee already assigned, or no open slots remain

### `DELETE /api/assignments/{id}`
Removes an assignment (unassigns the employee).

**Side effects**:
1. Sets `employees.status = 'available'`
2. Decrements `project_disciplines.filled_count`

---

## Error Responses (RFC 7807)

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Not Found",
  "status": 404,
  "detail": "Employee with id 99 was not found."
}
```

| Status | Meaning |
|--------|---------|
| 400    | Validation error (invalid dates, missing fields) |
| 404    | Resource not found |
| 409    | Conflict (duplicate email, no open slot, employee unavailable) |
| 500    | Unexpected server error |
