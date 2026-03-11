export type WorkingDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type ShiftType = 'MWF' | 'TTHS';

export const MWF_DAYS: WorkingDay[] = ['Monday', 'Wednesday', 'Friday'];
export const TTHS_DAYS: WorkingDay[] = ['Tuesday', 'Thursday', 'Saturday'];

export const SHIFT_DAYS: Record<ShiftType, WorkingDay[]> = {
    MWF: MWF_DAYS,
    TTHS: TTHS_DAYS,
};

/** Derive the shift label from a WorkingDays array. Defaults to 'TTHS' if Monday is absent. */
export function getShiftType(days: WorkingDay[]): ShiftType {
    return days.includes('Monday') ? 'MWF' : 'TTHS';
}

export interface Employee {
    EmployeeId: string;
    FirstName: string;
    LastName: string;
    DateOfBirth: string;
    DailyRate: number;
    WorkingDays: WorkingDay[];
}

export interface EmployeeDTO {
    FirstName: string;
    LastName: string;
    DateOfBirth: string;
    DailyRate: number;
    WorkingDays: WorkingDay[];
}

export interface CalculatedPayroll {
    EmployeeId: string;
    EmployeeName: string;
    StartDate: string;
    EndDate: string;
    TotalWorkingDays: number;
    DailyRate: number;
    IsBirthdayInRange: boolean;
    TotalSalary: number;
}

export interface PayrollDTO {
    EmployeeId: string;
    StartDate: string;
    EndDate: string;
}