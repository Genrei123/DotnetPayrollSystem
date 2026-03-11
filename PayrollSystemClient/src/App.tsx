import { useState, useEffect, useCallback } from 'react';
import type { Employee, EmployeeDTO } from '../types/Employee';
import { getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../api/employeeApi';
import EmployeeCard from './components/EmployeeCard';
import EmployeeModal from './components/EmployeeModal';
import EmployeeSummaryModal from './components/EmployeeSummaryModal';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; employee: Employee }
  | { type: 'view'; employee: Employee }
  | { type: 'delete'; employee: Employee };

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getEmployee();
      setEmployees(data);
    } catch {
      setFetchError('Failed to load employees. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreate = async (data: EmployeeDTO | Employee) => {
    await createEmployee(data as EmployeeDTO);
    await fetchEmployees();
    showToast('Employee created successfully!');
  };

  const handleUpdate = async (data: EmployeeDTO | Employee) => {
    const emp = data as Employee;
    await updateEmployee(emp.EmployeeId, emp);
    await fetchEmployees();
    showToast('Employee updated successfully!');
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    setDeleteLoading(true);
    try {
      await deleteEmployee(modal.employee.EmployeeId);
      await fetchEmployees();
      setModal({ type: 'none' });
      showToast('Employee deleted.');
    } catch {
      showToast('Failed to delete employee.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const q = search.toLowerCase();
    return (
      (emp.FirstName ?? '').toLowerCase().includes(q) ||
      (emp.LastName ?? '').toLowerCase().includes(q) ||
      (emp.EmployeeId ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">PayrollSystem</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Employee Management Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={() => setModal({ type: 'create' })}
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="text-base leading-none">+</span> Add Employee
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {!loading && !fetchError && (
          <div className="mb-6 flex gap-4 flex-wrap">
            <StatBadge label="Total Employees" value={employees.length} color="indigo" />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm">Loading employees…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-400 font-bold text-xl">!</span>
              </div>
            <p className="text-gray-500 text-sm">{fetchError}</p>
            <button
              onClick={fetchEmployees}
              className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && filteredEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-400 font-bold text-xl">—</span>
              </div>
            <p className="text-gray-500 text-sm">
              {search ? `No employees matching "${search}".` : 'No employees yet. Add your first one!'}
            </p>
            {!search && (
              <button
                onClick={() => setModal({ type: 'create' })}
                className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Add Employee
              </button>
            )}
          </div>
        )}

        {/* Employee grid */}
        {!loading && !fetchError && filteredEmployees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEmployees.map((emp, i) => (
              <EmployeeCard
                key={emp.EmployeeId ?? i}
                employee={emp}
                onView={e => setModal({ type: 'view', employee: e })}
                onEdit={e => setModal({ type: 'edit', employee: e })}
                onDelete={e => setModal({ type: 'delete', employee: e })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {(modal.type === 'create' || modal.type === 'edit') && (
        <EmployeeModal
          mode={modal.type}
          employee={modal.type === 'edit' ? modal.employee : null}
          onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {/* Summary Modal */}
      {modal.type === 'view' && (
        <EmployeeSummaryModal
          employee={modal.employee}
          onClose={() => setModal({ type: 'none' })}
          onEdit={e => setModal({ type: 'edit', employee: e })}
        />
      )}

      {/* Delete Confirm Modal */}
      {modal.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-400 font-bold text-xl">!</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">Delete Employee?</h3>
              <p className="text-sm text-gray-500">
                This will permanently delete{' '}
                <span className="font-medium text-gray-700">
                  {modal.employee.LastName}, {modal.employee.FirstName}
                </span>{' '}
                ({modal.employee.EmployeeId}). This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModal({ type: 'none' })}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: 'indigo' | 'blue' | 'purple' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colorMap[color]} text-sm`}>
      <span className="font-bold text-lg">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

export default App;
