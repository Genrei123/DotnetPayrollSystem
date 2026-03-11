# Payroll System

A full-stack employee payroll management system with a React frontend and an ASP.NET Core REST API backed by PostgreSQL.

---

## System Overview

### What It Does

| Feature | Description |
|---|---|
| Employee CRUD | Create, view, edit, and delete employee records |
| Shift Assignment | Employees are assigned either the **MWF** (Mon / Wed / Fri) or **TTHS** (Tue / Thu / Sat) shift |
| Payroll Calculator | Enter a date range to calculate total working days and gross salary for any employee via a server-side calculation |
| Birthday Detection | The payroll calculation flags whether the employee's birthday falls within the selected period |

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 5, Tailwind CSS v4, Axios |
| Backend | ASP.NET Core (.NET 10), C#, Entity Framework Core 10 |
| Database | PostgreSQL 16 (via Npgsql EF Core provider) |
| Container | Docker + Docker Compose |

### Architecture

```
Browser (localhost:5173)
        │
        │  HTTP / JSON
        ▼
React Frontend (Vite / served by `serve`)
        │
        │  VITE_API_URL  →  http://localhost:5118/api
        ▼
ASP.NET Core REST API (localhost:5118)
  ├── EmployeeController  →  /api/Employee
  │     GET    /               list all employees
  │     GET    /{id}           get one employee
  │     POST   /               create employee (validated shift)
  │     PUT    /{id}           update employee (validated shift)
  │     DELETE /{id}           delete employee
  │     POST   /calculate      calculate payroll for a date range
  ├── IEmployeeService / EmployeeService  (business logic + shift validation)
  └── AppDbContext  (EF Core)
        │
        │  Npgsql
        ▼
PostgreSQL (localhost:5432  /  payrolldb)
```

### Employee Model

| Field | Type | Notes |
|---|---|---|
| `EmployeeId` | `string` | Auto-generated: `{LastName3}-{5-digit random}-{DOB yyyyMMdd}` |
| `FirstName` | `string` | |
| `LastName` | `string` | |
| `DateOfBirth` | `DateOnly` | |
| `DailyRate` | `float` | PHP currency |
| `WorkingDays` | `List<WorkingDays>` | Must be exactly **MWF** or **TTHS** |

### Shift Rules

| Shift | Days |
|---|---|
| MWF | Monday, Wednesday, Friday |
| TTHS | Tuesday, Thursday, Saturday |

The backend rejects any `WorkingDays` list that does not exactly match one of the two shifts.

---

## Project Structure

```
CRUD/
├── Docker-compose.yml              # Orchestrates postgres, backend, frontend
│
├── PayrollSystem/                  # ASP.NET Core Web API
│   ├── Dockerfile                  # Multi-stage build (.NET 10 SDK → ASP.NET runtime)
│   ├── Program.cs                  # App bootstrap: DI, CORS, auto-migration on startup
│   ├── appsettings.json            # Base config (connection string placeholder)
│   ├── appsettings.Development.json# Local dev connection string (Neon/Postgres)
│   │
│   ├── Controllers/
│   │   └── EmployeeController.cs   # REST endpoints for /api/Employee
│   ├── Services/
│   │   └── EmployeeService.cs      # Business logic: CRUD, shift validation, salary calc
│   ├── Interfaces/
│   │   └── IEmployeeService.cs     # Service contract
│   ├── Models/
│   │   └── Employee.cs             # EF Core entity
│   ├── DTO/
│   │   └── EmployeeDTO.cs          # WorkingDays enum + request/response DTOs
│   ├── Contexts/
│   │   └── DB.cs                   # AppDbContext (EF Core)
│   └── Migrations/                 # EF Core migration history
│
└── PayrollSystemClient/            # React + TypeScript frontend
    ├── Dockerfile                  # Multi-stage: npm build → serve static dist
    ├── vite.config.ts              # Vite config (host 0.0.0.0 for Docker)
    ├── package.json
    │
    ├── api/
    │   ├── axiosInstance.ts        # Axios base URL from VITE_API_URL env var
    │   └── employeeApi.ts          # Typed API call functions
    ├── types/
    │   └── Employee.ts             # Shared TS interfaces + shift helpers
    └── src/
        ├── App.tsx                 # Dashboard shell, modal state machine, search
        ├── utils/
        │   └── formatters.ts       # formatCurrency, formatDate, toApiDate
        └── components/
            ├── EmployeeCard.tsx        # Card tile with View / Edit / Delete
            ├── EmployeeModal.tsx       # Create / Edit form (MWF / TTHS radio)
            └── EmployeeSummaryModal.tsx# Employee profile + payroll calculator
```

# Docker Setup
Run ```docker compose up --build```

## Running Locally (without Docker)

### Backend

```bash
cd PayrollSystem
dotnet restore
dotnet run
# API available at http://localhost:5118
```

### Frontend

```bash
cd PayrollSystemClient
npm install
npm run dev
# UI available at http://localhost:5173
```

## Packages
```dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

## Scaffolding
Controllers are created with aspnet-codegenerator

```dotnet aspnet-codegenerator controller -name EmployeeController -api -m Employee -dc AppDbContext -outDir Controllers```