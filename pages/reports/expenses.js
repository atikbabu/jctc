import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ExpenseReportPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    setMessage('');
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/reports/expenses?${query}`, { credentials: 'include' });

      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch expense report');
      }
      const data = await res.json();
      setExpenses(data.expenses);
      setTotalAmount(data.totalAmount);
    } catch (error) {
      setMessage(`❌ Error fetching report: ${error.message}`);
      setExpenses([]);
      setTotalAmount(0);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Expense Report</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div className="bg-white shadow p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Utilities, Rent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Expenses List</h2>
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Date</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td className="border border-gray-300 p-2">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{expense.amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{expense.category}</td>
                <td className="border border-gray-300 p-2">{expense.description || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{expense.recordedBy?.name || 'N/A'}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">No expenses found for the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-right mt-4 text-lg font-bold">
          Total Expenses: ৳ {totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
