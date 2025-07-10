import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditDailyAttendancePage() {
  const router = useRouter();
  const { id } = router.query;
  const [attendanceLog, setAttendanceLog] = useState(null);
  const [form, setForm] = useState({
    employee: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchAttendanceLog();
      fetchEmployees();
    }
  }, [id]);

  const fetchAttendanceLog = async () => {
    try {
      const res = await fetch(`/api/daily-attendance/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch attendance log');
      }
      const data = await res.json();
      setAttendanceLog(data);
      setForm({
        employee: data.employee._id,
        date: new Date(data.date).toISOString().split('T')[0],
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
      });
    } catch (err) {
      setMessage(`❌ Error fetching attendance log: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      setMessage(`❌ Error fetching employees: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/daily-attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('✅ Attendance log updated successfully');
        setTimeout(() => router.push('/hrm/daily-attendance'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (message && message.startsWith('❌ Error fetching attendance log')) {
    return <div className="p-6 text-red-500">{message}</div>;
  }

  if (!attendanceLog) {
    return <div className="p-6">Attendance log not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Daily Attendance Log</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Employee</label>
          <select
            id="employee"
            name="employee"
            value={form.employee}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">Check-in Time</label>
          <input
            type="time"
            id="checkInTime"
            name="checkInTime"
            value={form.checkInTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700">Check-out Time</label>
          <input
            type="time"
            id="checkOutTime"
            name="checkOutTime"
            value={form.checkOutTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Attendance Log
          </button>
          <Link href="/hrm/daily-attendance" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
