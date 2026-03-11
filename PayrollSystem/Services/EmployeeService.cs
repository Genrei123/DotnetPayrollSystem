using System.Globalization;
using Microsoft.EntityFrameworkCore;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;

    private static readonly List<WorkingDays> MWF  = [WorkingDays.Monday, WorkingDays.Wednesday, WorkingDays.Friday];
    private static readonly List<WorkingDays> TTHS = [WorkingDays.Tuesday, WorkingDays.Thursday, WorkingDays.Saturday];

    private static bool IsValidShift(List<WorkingDays> days)
    {
        if (days == null || days.Count != 3) return false;
        var sorted = days.OrderBy(d => (int)d).ToList();
        return sorted.SequenceEqual(MWF.OrderBy(d => (int)d))
            || sorted.SequenceEqual(TTHS.OrderBy(d => (int)d));
    }

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Employee> AddEmployee(EmployeeDTO employee)
    {
        if (employee == null)
        {
            throw new ArgumentNullException(nameof(employee), "Employee data cannot be null.");
        }
        if (!IsValidShift(employee.WorkingDays))
        {
            throw new ArgumentException("WorkingDays must be either MWF (Monday, Wednesday, Friday) or TTHS (Tuesday, Thursday, Saturday).");
        }
        Employee newEmployee = new Employee
        {
            EmployeeId = await GenerateEmployeeId(employee),
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            DateOfBirth = employee.DateOfBirth,
            DailyRate = employee.DailyRate,
            WorkingDays = employee.WorkingDays
        };
        _context.Employees.Add(newEmployee);
        await _context.SaveChangesAsync();
        return newEmployee;
    }

    private async Task<string> GenerateEmployeeId(EmployeeDTO employee)
    {
        string name = employee.LastName.Length >= 3 ? employee.LastName.Substring(0, 3).ToUpper() : employee.LastName.ToUpper().PadRight(3, '*');
        Random random = new Random();
        string shortMonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(int.Parse(employee.DateOfBirth.ToString("MM"))).ToUpper();
        string newId = $"{name}-{random.Next(10000, 99999)}-{employee.DateOfBirth:dd}{shortMonthName}{employee.DateOfBirth:yyyy}";
        bool exists = await _context.Employees.AnyAsync(e => e.EmployeeId == newId);
        if (exists)
        {
            int suffix = 1;
            string tempId;
            do
            {
                tempId = $"{newId}{suffix}";
                suffix++;
            } while (await _context.Employees.AnyAsync(e => e.EmployeeId == tempId));
            newId = tempId;
        }
        return newId;
    }

    public async Task<Employee> GetEmployeeById(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            throw new ArgumentException("Employee ID cannot be null or empty.");
        }
        Employee employee = await _context.Employees.FindAsync(id) ?? throw new KeyNotFoundException($"Employee with ID {id} not found.");
        return employee;
    }

    public async Task<List<Employee>> GetAllEmployees()
    {
        return await _context.Employees.ToListAsync();
    }

    public async Task<Employee> UpdateEmployee(string id, Employee updatedEmployee)
    {
        if (string.IsNullOrEmpty(id))
        {
            throw new ArgumentException("Employee ID cannot be null or empty.");
        }
        Employee existingEmployee = await _context.Employees.FindAsync(id) ?? throw new KeyNotFoundException($"Employee with ID {id} not found.");

        if (!IsValidShift(updatedEmployee.WorkingDays))
        {
            throw new ArgumentException("WorkingDays must be either MWF (Monday, Wednesday, Friday) or TTHS (Tuesday, Thursday, Saturday).");
        }

        existingEmployee.FirstName = updatedEmployee.FirstName;
        existingEmployee.LastName = updatedEmployee.LastName;
        existingEmployee.DateOfBirth = updatedEmployee.DateOfBirth;
        existingEmployee.WorkingDays = updatedEmployee.WorkingDays;
        existingEmployee.DailyRate = updatedEmployee.DailyRate;

        await _context.SaveChangesAsync();
        return existingEmployee;
    }

    public async Task<bool> DeleteEmployee(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            throw new ArgumentException("Employee ID cannot be null or empty.");
        }
        Employee employee = await _context.Employees.FindAsync(id) ?? throw new KeyNotFoundException($"Employee with ID {id} not found.");
        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CalculatedPayrollDTO> CalculateSalary(PayrollDTO payroll)
    {
        if (payroll == null)
        {
            throw new ArgumentNullException(nameof(payroll), "Payroll data cannot be null.");
        }

        Employee employee = await _context.Employees.FindAsync(payroll.EmployeeId) ?? throw new KeyNotFoundException($"Employee with ID {payroll.EmployeeId} not found.");
        int totalWorkingDays = CalculateWorkingDays(payroll.StartDate, payroll.EndDate, employee.WorkingDays);
        bool isBirthdayInRange = IsBirthdayInRange(employee.DateOfBirth, payroll.StartDate, payroll.EndDate);
        float totalSalary = totalWorkingDays * employee.DailyRate * 2;

        if (isBirthdayInRange)
        {
            totalSalary += employee.DailyRate; 
        }

        return new CalculatedPayrollDTO
        {
            EmployeeId = employee.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            StartDate = payroll.StartDate,
            EndDate = payroll.EndDate,
            TotalWorkingDays = totalWorkingDays,
            DailyRate = employee.DailyRate,
            IsBirthdayInRange = isBirthdayInRange,
            TotalSalary = totalSalary
        };
    }

    private int CalculateWorkingDays(DateOnly start, DateOnly end, List<WorkingDays> workingDays)
    {
        int count = 0;
        for (DateOnly date = start; date <= end; date = date.AddDays(1))
        {
            WorkingDays day = date.DayOfWeek switch
            {
                DayOfWeek.Monday => WorkingDays.Monday,
                DayOfWeek.Tuesday => WorkingDays.Tuesday,
                DayOfWeek.Wednesday => WorkingDays.Wednesday,
                DayOfWeek.Thursday => WorkingDays.Thursday,
                DayOfWeek.Friday => WorkingDays.Friday,
                DayOfWeek.Saturday => WorkingDays.Saturday,
                DayOfWeek.Sunday => WorkingDays.Sunday,
                _ => WorkingDays.None
            };

            if (workingDays.Contains(day))
            {
                count++;
            }
        }
        return count;
    }

    private bool IsBirthdayInRange(DateOnly dob, DateOnly start, DateOnly end)
    {
        DateOnly birthdayThisYear = new DateOnly(start.Year, dob.Month, dob.Day);
        if (birthdayThisYear < start)
        {
            birthdayThisYear = birthdayThisYear.AddYears(1);
        }
        return birthdayThisYear >= start && birthdayThisYear <= end;
    }
}