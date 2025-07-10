
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function WorkOrderDetails() {
  const [workOrder, setWorkOrder] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchWorkOrder();
    }
  }, [id]);

  const fetchWorkOrder = async () => {
    const res = await fetch(`/api/work-orders/${id}`);
    const data = await res.json();
    setWorkOrder(data.data);
  };

  const handleAdvanceStage = async () => {
    const res = await fetch(`/api/work-orders/${id}/advance-stage`, {
      method: 'POST',
    });
    if (res.ok) {
      fetchWorkOrder(); // Re-fetch work order to update UI
    }
  };

  if (!workOrder) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Work Order #{workOrder.orderNumber}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Details</h2>
          <p><strong>Product:</strong> {workOrder.product.name}</p>
          <p><strong>Quantity:</strong> {workOrder.quantity}</p>
          <p><strong>Status:</strong> {workOrder.status}</p>
          {workOrder.currentStage && (
            <p><strong>Current Stage:</strong> {workOrder.currentStage.name}</p>
          )}
          <p><strong>Created At:</strong> {new Date(workOrder.createdAt).toLocaleDateString()}</p>
          {workOrder.status !== 'Completed' && (
            <button
              onClick={handleAdvanceStage}
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Advance Stage
            </button>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Production Stages</h2>
          <ul className="list-disc list-inside">
            {workOrder.stages.map(stage => (
              <li key={stage._id} className={workOrder.currentStage && stage._id === workOrder.currentStage._id ? 'font-bold text-indigo-600' : ''}>
                {stage.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Raw Materials Used</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Used</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workOrder.rawMaterialsUsed.map(item => (
                <tr key={item.material._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
