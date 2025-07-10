import { useState, useEffect } from 'react';

export default function ReorderMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReorderMaterials();
  }, []);

  const fetchReorderMaterials = async () => {
    try {
      const res = await fetch('/api/reports/reorder-materials');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch reorder materials');
      }
      const data = await res.json();
      setMaterials(data);
    } catch (error) {
      setMessage(`❌ Error fetching reorder materials: ${error.message}`);
      setMaterials([]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Materials Below Reorder Level</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      {materials.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Material Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Current Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">{material.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{material.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{material.reorderLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{material.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">All materials are above their reorder level.</p>
      )}
    </div>
  );
}
