import { useState } from 'react';
import type { CalculatedPayroll, Employee } from '../../types/Employee';
import { getShiftType } from '../../types/Employee';
import { calculatePayroll } from '../../api/employeeApi';
import { formatCurrency, formatDate } from '../utils/formatters';

interface EmployeeSummaryModalProps {
    employee: Employee;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
}

export default function EmployeeSummaryModal({ employee, onClose, onEdit }: EmployeeSummaryModalProps) {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [result, setResult] = useState<CalculatedPayroll | null>(null);
    const [calcError, setCalcError] = useState('');
    const [calcLoading, setCalcLoading] = useState(false);

    const days = employee.WorkingDays ?? [];
    const workingDaysLabel = days.length > 0 ? getShiftType(days) : '—';

    const handleCalculate = async () => {
        setCalcError('');
        if (!startDate || !endDate) {
            setCalcError('Please select both start and end dates.');
            return;
        }
        if (startDate > endDate) {
            setCalcError('Start date must be before or equal to end date.');
            return;
        }
        setCalcLoading(true);
        try {
            const data = await calculatePayroll({
                EmployeeId: employee.EmployeeId,
                StartDate: startDate,
                EndDate: endDate,
            });
            setResult(data);
        } catch {
            setCalcError('Failed to calculate pay. Please try again.');
        } finally {
            setCalcLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h2 className="text-lg font-semibold text-gray-800">Employee Summary</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(employee)}
                            className="text-sm px-3 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none ml-2 font-medium"
                        >
                            X
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 flex flex-col gap-6">
                    {/* Profile */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl select-none flex-shrink-0">
                            {(employee.FirstName ?? '').charAt(0).toUpperCase()}{(employee.LastName ?? '').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {employee.LastName}, {employee.FirstName}
                            </h3>
                            <p className="text-sm font-mono text-indigo-500">{employee.EmployeeId}</p>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoBlock label="Date of Birth" value={formatDate(employee.DateOfBirth)} />
                        <InfoBlock label="Daily Rate" value={formatCurrency(employee.DailyRate)} className="text-emerald-600 font-semibold" />
                        <InfoBlock
                            label="Working Days"
                            value={`${employee.WorkingDays} — ${workingDaysLabel}`}
                        />
                        <InfoBlock label="Shifts per Week" value="3 days per week" />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Take-home pay calculator */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Calculate Pay</h4>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex flex-col gap-1 flex-1 min-w-32">
                                <label className="text-xs text-gray-500 font-medium">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => { setStartDate(e.target.value); setResult(null); }}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1 min-w-32">
                                <label className="text-xs text-gray-500 font-medium">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => { setEndDate(e.target.value); setResult(null); }}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCalculate}
                                    disabled={calcLoading}
                                    className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                >
                                    {calcLoading ? 'Calculating...' : 'Calculate Pay'}
                                </button>
                            </div>
                        </div>

                        {calcError && (
                            <p className="text-red-500 text-sm mt-2">{calcError}</p>
                        )}

                        {result && (
                            <div className="mt-5 flex flex-col gap-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <SummaryTile label="Working Days" value={String(result.TotalWorkingDays)} color="indigo" />
                                    <SummaryTile label="Birthday Bonus" value={result.IsBirthdayInRange ? formatCurrency(result.DailyRate) : 'None'} color="pink" />
                                    <SummaryTile label="Total Take-Home" value={formatCurrency(result.TotalSalary)} color="emerald" large />
                                </div>

                                <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-500">Employee</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{result.EmployeeId}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-500">Period</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{formatDate(result.StartDate)} — {formatDate(result.EndDate)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-500">Working Days</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{result.TotalWorkingDays} days</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-500">Daily Rate</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(result.DailyRate)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-500">Birthday in Range</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        result.IsBirthdayInRange
                                                            ? 'bg-pink-100 text-pink-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {result.IsBirthdayInRange ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-50 font-semibold">
                                                <td className="px-4 py-3 text-gray-700">Total Take-Home Pay</td>
                                                <td className="px-4 py-3 text-emerald-600 text-base">{formatCurrency(result.TotalSalary)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-sm text-gray-700 ${className}`}>{value}</p>
        </div>
    );
}

function SummaryTile({ label, value, color, large }: { label: string; value: string; color: 'indigo' | 'pink' | 'emerald'; large?: boolean }) {
    const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-700',
        pink: 'bg-pink-50 text-pink-700',
        emerald: 'bg-emerald-50 text-emerald-700',
    };
    return (
        <div className={`${colorMap[color]} rounded-xl px-4 py-3 text-center`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{label}</p>
            <p className={`font-bold ${large ? 'text-lg' : 'text-base'}`}>{value}</p>
        </div>
    );
}
