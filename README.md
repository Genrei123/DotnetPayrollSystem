# Packages

dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL


# Scaffolding
dotnet aspnet-codegenerator controller -name EmployeeController -api -m Employee -dc AppDbContext -outDir Controllers

# DotnetPayrollSystem
