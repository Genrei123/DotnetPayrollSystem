import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Employee, EmployeeDTO, ShiftType } from '../../types/Employee';
import { SHIFT_DAYS, getShiftType } from '../../types/Employee';

interface EmployeeModalProps {
    mode: 'create' | 'edit';
    employee?: Employee | null;
    onSubmit: (data: EmployeeDTO | Employee) => Promise<void>;
    onClose: () => void;
}

const emptyForm = {
    FirstName: '',
    LastName: '',
    DateOfBirth: '',
    DailyRate: 0,
};

export default function EmployeeModal({ mode, employee, onSubmit, onClose }: EmployeeModalProps) {
    const [form, setForm] = useState(emptyForm);
    const [shift, setShift] = useState<ShiftType>('MWF');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (mode === 'edit' && employee) {
            setForm({
                FirstName: employee.FirstName,
                LastName: employee.LastName,
                DateOfBirth: employee.DateOfBirth,
                DailyRate: employee.DailyRate,
            });
            setShift(getShiftType(employee.WorkingDays));
        } else {
            setForm(emptyForm);
            setShift('MWF');
        }
        setError('');
    }, [mode, employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'DailyRate' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.FirstName.trim() || !form.LastName.trim() || !form.DateOfBirth) {
            setError('Please fill in all required fields.');
            return;
        }
        if (form.DailyRate <= 0) {
            setError('Daily rate must be greater than 0.');
            return;
        }

        const dto: EmployeeDTO = { ...form, WorkingDays: SHIFT_DAYS[shift] };

        setLoading(true);
        setError('');
        try {
            if (mode === 'edit' && employee) {
                await onSubmit({ ...employee, ...dto });
            } else {
                await onSubmit(dto);
            }
            onClose();
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {mode === 'create' ? 'New Employee' : 'Edit Employee'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                    >
                        X
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name *</label>
                            <input
                                name="FirstName"
                                value={form.FirstName}
                                onChange={handleChange}
                                placeholder="Juan"
                                required
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name *</label>
                            <input
                                name="LastName"
                                value={form.LastName}
                                onChange={handleChange}
                                placeholder="Dela Cruz"
                                required
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth *</label>
                        <input
                            name="DateOfBirth"
                            type="date"
                            value={form.DateOfBirth}
                            onChange={handleChange}
                            required
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Daily Rate (PHP) *</label>
                        <input
                            name="DailyRate"
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.DailyRate || ''}
                            onChange={handleChange}
                            placeholder="2000.00"
                            required
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shift *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['MWF', 'TTHS'] as ShiftType[]).map(option => (
                                <label
                                    key={option}
                                    className={`flex flex-col items-center gap-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all select-none ${
                                        shift === option
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="shift"
                                        value={option}
                                        checked={shift === option}
                                        onChange={() => setShift(option)}
                                        className="sr-only"
                                    />
                                    <span className="text-base font-bold">{option}</span>
                                    <span className="text-xs text-center">
                                        {option === 'MWF' ? 'Mon · Wed · Fri' : 'Tue · Thu · Fri'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {mode === 'edit' && employee && (
                        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                            Employee ID: <span className="font-mono font-medium text-gray-600">{employee.EmployeeId}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Saving…' : mode === 'create' ? 'Create Employee' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
