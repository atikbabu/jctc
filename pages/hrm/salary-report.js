import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SalaryReportPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [skillsBonus, setSkillsBonus] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchEmployees();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setMessage('');
    setReportData(null);
    setLoading(true);

    if (!selectedEmployee || !startDate || !endDate) {
      setMessage('❌ Please select an employee, start date, and end date.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/reports/salary-summary?employeeId=${selectedEmployee}&startDate=${startDate}&endDate=${endDate}&skillsBonus=${skillsBonus}`);
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate report');
      }
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      setMessage(`❌ Error generating report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const renderDailyQuantities = (dailyQuantities) => {
    const days = [];
    for (let i = 1; i <= 30; i++) { // Assuming max 30 days for display based on your example
      days.push(<td key={i} className="border p-2 text-center">{dailyQuantities[i] || ''}</td>);
    }
    return days;
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Employee Salary Report</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleGenerateReport} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Select Employee</label>
          <select
            id="employee"
            name="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="skillsBonus" className="block text-sm font-medium text-gray-700">Skills Bonus</label>
          <input
            type="number"
            id="skillsBonus"
            name="skillsBonus"
            value={skillsBonus}
            onChange={(e) => setSkillsBonus(parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {reportData && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Salary Report for {reportData.employeeName} ({reportData.employeeId})</h2>
          <p className="mb-2">Period: {reportData.startDate} to {reportData.endDate}</p>
          <p className="mb-2">Rank: {reportData.employeeRank}</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Fixed Allowances</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <p><strong>Basic Pay:</strong> {reportData.fixedAllowances.basicPay.toFixed(2)}</p>
            <p><strong>House Rent Allowance:</strong> {reportData.fixedAllowances.houseRentAllowance.toFixed(2)}</p>
            <p><strong>Medical Allowance:</strong> {reportData.fixedAllowances.medicalAllowance.toFixed(2)}</p>
            <p><strong>Conveyance Allowance:</strong> {reportData.fixedAllowances.conveyanceAllowance.toFixed(2)}</p>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Production Earnings</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Ser</th>
                  <th className="border p-2 text-left">Product Name</th>
                  <th className="border p-2 text-center">Total</th>
                  <th className="border p-2 text-center">M/Charge</th>
                  <th className="border p-2 text-center">T/M/Charge</th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="border p-2 text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.productionEarnings.products.map((product, index) => (
                  <tr key={product.productName}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{product.productName}</td>
                    <td className="border p-2 text-center">{product.totalQuantity}</td>
                    <td className="border p-2 text-center">{product.manpowerCharge.toFixed(2)}</td>
                    <td className="border p-2 text-center">{product.totalManpowerCharge.toFixed(2)}</td>
                    {renderDailyQuantities(product.dailyQuantities)}
                  </tr>
                ))}
                <tr>
                  <td colSpan="4" className="border p-2 text-right font-bold">Grand Total Production:</td>
                  <td className="border p-2 text-center font-bold">{reportData.productionEarnings.grandTotalManpowerCharge.toFixed(2)}</td>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <td key={`total-day-${day}`} className="border p-2 text-center"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Overtime Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <p><strong>Total Overtime Hours:</strong> {reportData.overtime.totalOvertimeHours.toFixed(2)}</p>
            <p><strong>Overtime Allowance Per Hour:</strong> {reportData.overtime.overtimeAllowancePerHour.toFixed(2)}</p>
            <p><strong>Total Overtime Pay:</strong> {reportData.overtime.overtimePay.toFixed(2)}</p>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Skills Bonus</h3>
          <p className="text-sm mb-4"><strong>Skills Bonus:</strong> {reportData.skillsBonus.toFixed(2)}</p>

          <h2 className="text-xl font-bold mt-6">Net Salary: {reportData.netSalary.toFixed(2)}</h2>
        </div>
      )}
    </div>
  );
}
