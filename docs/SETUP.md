# Development Environment Setup

## Prerequisites

| Tool               | Version  | Install                                   |
|--------------------|----------|-------------------------------------------|
| Node.js            | 20.x     | Already installed                         |
| npm                | 10.x     | Comes with Node                           |
| Angular CLI        | 20.x     | Already installed (`ng version`)          |
| .NET SDK           | 8.0.300  | Already installed (`dotnet --version`)    |
| PostgreSQL         | 17.x     | See below                                 |
| EF Core CLI tools  | 8.x      | `dotnet tool install -g dotnet-ef`        |

---

## 1 — Install PostgreSQL

### Option A — Local install (Windows)
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings; note the password you set for the `postgres` user
3. Default port: `5432`

### Option B — Docker (recommended for local dev, no system install)
```bash
# Pull and run PostgreSQL 17
docker run --name pms-postgres \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=pms_db \
  -p 5432:5432 \
  -d postgres:17
```

### Create the database (if not using Docker)
```sql
-- In psql or pgAdmin
CREATE DATABASE pms_db;
```

---

## 2 — Backend Setup

```bash
# From the repo root
cd pms-api

# Restore packages
dotnet restore

# Install EF Core CLI (one-time global install)
dotnet tool install -g dotnet-ef

# Verify
dotnet ef --version

# Set connection string in appsettings.Development.json
# (edit Host/Username/Password as needed)

# Run migrations to create tables
dotnet ef database update --project PMS.API

# Start API (runs on http://localhost:5000)
dotnet run --project PMS.API
```

Visit http://localhost:5000/swagger to confirm the API is running.

---

## 3 — Frontend Setup

```bash
# From the repo root
cd pms-client

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:5000)
ng serve

# Open: http://localhost:4200
```

### Angular proxy config (proxy.conf.json)
Create `pms-client/proxy.conf.json` to avoid CORS issues in dev:
```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Then in `angular.json`, under `serve > options`:
```json
"proxyConfig": "proxy.conf.json"
```

With this proxy in place you can set `apiUrl: '/api'` in `environment.ts` for both dev and prod.

---

## 4 — Running Both Together

Open two terminals:

```bash
# Terminal 1 — API
cd pms-api && dotnet run --project PMS.API

# Terminal 2 — Client
cd pms-client && ng serve
```

---

## 5 — Database GUI (Optional)

- **pgAdmin 4** — ships with PostgreSQL installer
- **DBeaver** — free, cross-platform: https://dbeaver.io/download/
- **TablePlus** — lightweight GUI (free tier available)

Connection settings:
```
Host:     localhost
Port:     5432
Database: pms_db
User:     postgres
Password: (the password you set)
```

---

## 6 — Common Commands Reference

### Backend
```bash
dotnet run --project PMS.API                    # start API
dotnet ef migrations add <Name> --project PMS.API   # new migration
dotnet ef database update --project PMS.API         # apply migrations
dotnet test                                          # run tests
```

### Frontend
```bash
ng serve           # start dev server
ng build --prod    # production build (output: dist/)
ng generate component features/employees/my-comp --standalone
ng lint            # lint check
```

---

## 7 — Recommended VS Code Extensions

- C# Dev Kit (`ms-dotnettools.csdevkit`)
- Angular Language Service (`angular.ng-template`)
- ESLint (`dbaeumer.vscode-eslint`)
- PostgreSQL (`ms-ossdata.vscode-postgresql`)
- REST Client (`humao.rest-client`) — test API calls from `.http` files
