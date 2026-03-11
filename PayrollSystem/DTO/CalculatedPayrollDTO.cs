public class CalculatedPayrollDTO
{
    public string EmployeeId { get; set; }
    public string EmployeeName { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalWorkingDays { get; set; }
    public float DailyRate { get; set; }
    public bool IsBirthdayInRange { get; set; }
    public float TotalSalary { get; set; }
}