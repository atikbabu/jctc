import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MaterialCostReportPage() {
  const router = useRouter();
  const [materialCosts, setMaterialCosts] = useState([]);
  const [materials, setMaterials] = useState([]); // For material filter dropdown
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    materialId: '',
  });

  useEffect(() => {
    fetchMaterials(); // Fetch materials for the filter dropdown
  }, []);

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials', { credentials: 'include' });
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch materials for filter');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        console.error('API returned non-array data for materials:', data);
        setMaterials([]);
      }
    } catch (error) {
      setMessage(`❌ Error fetching materials: ${error.message}`);
      setMaterials([]);
    }
  };

  const fetchReport = async () => {
    setMessage('');
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/reports/material-cost?${query}`, { credentials: 'include' });

      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch material cost report');
      }
      const data = await res.json();
      setMaterialCosts(data.materialCosts);
    } catch (error) {
      setMessage(`❌ Error fetching report: ${error.message}`);
      setMaterialCosts([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const totalReportCost = materialCosts.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Material Cost Report</h1>

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
            <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">Material</label>
            <select
              id="materialId"
              name="materialId"
              value={filters.materialId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Materials</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Material Costs List</h2>
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Material Name</th>
              <th className="border border-gray-300 p-2 text-right">Total Quantity Purchased</th>
              <th className="border border-gray-300 p-2 text-right">Total Cost (৳)</th>
              <th className="border border-gray-300 p-2 text-right">Avg. Cost Per Unit (৳)</th>
            </tr>
          </thead>
          <tbody>
            {materialCosts.map((item) => (
              <tr key={item.materialId}>
                <td className="border border-gray-300 p-2">{item.materialName}</td>
                <td className="border border-gray-300 p-2 text-right">{item.totalQuantity}</td>
                <td className="border border-gray-300 p-2 text-right">{item.totalCost.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-right">{item.averageCostPerUnit.toFixed(2)}</td>
              </tr>
            ))}
            {materialCosts.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">No material costs found for the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-right mt-4 text-lg font-bold">
          Total Report Cost: ৳ {totalReportCost.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
