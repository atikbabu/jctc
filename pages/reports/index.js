
import { useState, useEffect } from 'react';

export default function Reports() {
  const [productionSummary, setProductionSummary] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);

  useEffect(() => {
    fetchProductionSummary();
    fetchInventorySummary();
  }, []);

  const fetchProductionSummary = async () => {
    const res = await fetch('/api/reports/production-summary');
    const data = await res.json();
    setProductionSummary(data.data);
  };

  const fetchInventorySummary = async () => {
    const res = await fetch('/api/reports/inventory-summary');
    const data = await res.json();
    setInventorySummary(data.data);
  };

  if (!productionSummary || !inventorySummary) return <div className="p-4">Loading reports...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Production Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Work Orders</h3>
            <p className="text-3xl font-bold">{productionSummary.totalWorkOrders}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Pending</h3>
            <p className="text-3xl font-bold">{productionSummary.pendingWorkOrders}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <p className="text-3xl font-bold">{productionSummary.inProgressWorkOrders}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Completed</h3>
            <p className="text-3xl font-bold">{productionSummary.completedWorkOrders}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Cancelled</h3>
            <p className="text-3xl font-bold">{productionSummary.cancelledWorkOrders}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Quantity Produced</h3>
            <p className="text-3xl font-bold">{productionSummary.totalQuantityProduced}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Inventory Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Raw Materials</h3>
            <p className="text-3xl font-bold">{inventorySummary.totalRawMaterials}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Processed Goods</h3>
            <p className="text-3xl font-bold">{inventorySummary.totalProcessedGoods}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Finished Goods</h3>
            <p className="text-3xl font-bold">{inventorySummary.totalFinishedGoods}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
