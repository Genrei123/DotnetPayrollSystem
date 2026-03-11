public interface IEmployeeService
{
    Task<Employee> AddEmployee(EmployeeDTO employee);
    Task<Employee> GetEmployeeById(string id);
    Task<List<Employee>> GetAllEmployees();
    Task<Employee> UpdateEmployee(string id, Employee employee);
    Task<bool> DeleteEmployee(string id);
    Task<CalculatedPayrollDTO> CalculateSalary(PayrollDTO payroll);
}