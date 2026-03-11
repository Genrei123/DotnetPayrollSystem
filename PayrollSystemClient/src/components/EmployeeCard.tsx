import type { Employee } from '../../types/Employee';
import { getShiftType } from '../../types/Employee';
import { formatCurrency, formatDate } from '../utils/formatters';

interface EmployeeCardProps {
    employee: Employee;
    onView: (employee: Employee) => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onView, onEdit, onDelete }: EmployeeCardProps) {
    const days = employee.WorkingDays ?? [];
    const shift = days.length > 0 ? getShiftType(days) : null;
    const workingDaysLabel = shift ?? '—';
    const workingDaysColor = shift === 'MWF'
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-violet-100 text-violet-700';

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden border border-gray-100">
            {/* Card header strip */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-400" />

            <div className="p-5 flex flex-col flex-1">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg select-none flex-shrink-0">
                        {(employee.FirstName ?? '').charAt(0).toUpperCase()}{(employee.LastName ?? '').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-gray-800 text-base leading-tight truncate">
                            {employee.LastName}, {employee.FirstName}
                        </h2>
                        <p className="text-xs text-gray-400 font-mono truncate">{employee.EmployeeId}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2 text-sm text-gray-600 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16 text-xs">Birthday</span>
                        <span>{formatDate(employee.DateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16 text-xs">Rate</span>
                        <span className="font-medium text-emerald-600">{formatCurrency(employee.DailyRate)}<span className="text-gray-400 font-normal text-xs"> / day</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16 text-xs">Schedule</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${workingDaysColor}`}>
                            {workingDaysLabel}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => onView(employee)}
                        className="flex-1 text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg py-2 transition-colors"
                    >
                        View
                    </button>
                    <button
                        onClick={() => onEdit(employee)}
                        className="flex-1 text-sm font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg py-2 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(employee)}
                        className="flex-1 text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 rounded-lg py-2 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
