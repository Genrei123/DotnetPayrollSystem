public enum WorkingDays
{
    None      = 0,
    Monday    = 1,  
    Tuesday   = 2,  
    Wednesday = 3,  
    Thursday  = 4,  
    Friday    = 5,  
    Saturday  = 6,  
    Sunday    = 7, 
}

public class EmployeeDTO
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public float DailyRate { get; set; }
    public List<WorkingDays> WorkingDays { get; set; }
}