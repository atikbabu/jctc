import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DailyProductionEntryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    employee: '',
    processingProduct: '',
    productionStage: '',
    date: new Date().toISOString().split('T')[0],
    unitsCompleted: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [processingProducts, setProcessingProducts] = useState([]);
  const [productionStages, setProductionStages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, processingProductsRes, productionStagesRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/processing-products'),
          fetch('/api/production-stages'),
        ]);

        if (employeesRes.status === 403 || processingProductsRes.status === 403 || productionStagesRes.status === 403) {
          router.push('/login');
          return;
        }

        const employeesData = await employeesRes.json();
        const processingProductsData = await processingProductsRes.json();
        const productionStagesData = await productionStagesRes.json();

        setEmployees(employeesData);
        setProcessingProducts(processingProductsData);
        setProductionStages(productionStagesData);
      } catch (error) {
        setMessage(`❌ Error fetching data: ${error.message}`);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/daily-production-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage('✅ Daily production logged successfully');
        setForm({
          ...form,
          unitsCompleted: 0, // Reset unitsCompleted after successful submission
          date: new Date().toISOString().split('T')[0], // Reset date to current
        });
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Daily Production Entry</h1>

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
          <label htmlFor="processingProduct" className="block text-sm font-medium text-gray-700">Processing Product</label>
          <select
            id="processingProduct"
            name="processingProduct"
            value={form.processingProduct}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Processing Product</option>
            {processingProducts.map((prod) => (
              <option key={prod._id} value={prod._id}>
                {prod.processingCode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="productionStage" className="block text-sm font-medium text-gray-700">Production Stage</label>
          <select
            id="productionStage"
            name="productionStage"
            value={form.productionStage}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Production Stage</option>
            {productionStages.map((stage) => (
              <option key={stage._id} value={stage._id}>
                {stage.name}
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
          <label htmlFor="unitsCompleted" className="block text-sm font-medium text-gray-700">Units Completed</label>
          <input
            type="number"
            id="unitsCompleted"
            name="unitsCompleted"
            value={form.unitsCompleted}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log Production
        </button>
      </form>
    </div>
  );
}
