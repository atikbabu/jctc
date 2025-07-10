import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ExpenseVsSellReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState({
    totalExpenses: 0,
    totalSales: 0,
  });
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    setMessage('');
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/reports/expense-vs-sell?${query}`, { credentials: 'include' });

      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch expense vs sell report');
      }
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      setMessage(`❌ Error fetching report: ${error.message}`);
      setReportData({ totalExpenses: 0, totalSales: 0 });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const profitLoss = reportData.totalSales - reportData.totalExpenses;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Expense vs. Sell Report</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div className="bg-white shadow p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-right">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Total Expenses</td>
              <td className="border border-gray-300 p-2 text-right">{reportData.totalExpenses.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Total Sales</td>
              <td className="border border-gray-300 p-2 text-right">{reportData.totalSales.toFixed(2)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2 font-bold">Profit/Loss</td>
              <td className={`border border-gray-300 p-2 font-bold text-right ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLoss.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
