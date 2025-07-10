import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AnnualTurnoverReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState({
    year: new Date().getFullYear(),
    totalTurnover: 0,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportData.year]);

  const fetchReport = async () => {
    setMessage('');
    try {
      const res = await fetch(`/api/reports/annual-turnover?year=${reportData.year}`, { credentials: 'include' });

      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch annual turnover report');
      }
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      setMessage(`❌ Error fetching report: ${error.message}`);
      setReportData({ ...reportData, totalTurnover: 0 });
    }
  };

  const handleYearChange = (e) => {
    setReportData({ ...reportData, year: Number(e.target.value) });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Annual Turnover Report</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div className="bg-white shadow p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">Select Year</label>
          <select
            id="year"
            name="year"
            value={reportData.year}
            onChange={handleYearChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary for {reportData.year}</h2>
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-right">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Total Annual Turnover</td>
              <td className="border border-gray-300 p-2 text-right">{reportData.totalTurnover.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
