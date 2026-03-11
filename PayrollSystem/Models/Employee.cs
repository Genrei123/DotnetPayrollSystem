public class Employee
{
    public string EmployeeId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public List<WorkingDays> WorkingDays { get; set; }
    public float DailyRate { get; set; }
}