
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AddWorkOrder() {
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedStages, setSelectedStages] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch products (assuming you have a materials API)
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/materials');
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      }
    };

    // Fetch production stages
    const fetchStages = async () => {
      try {
        const res = await fetch('/api/production-stages');
        if (!res.ok) {
          throw new Error(`Failed to fetch production stages: ${res.statusText}`);
        }
        const data = await res.json();
        setStages(data.data || []);
      } catch (err) {
        setError(err.message);
        setStages([]);
      }
    };

    fetchProducts();
    fetchStages();
  }, []);

  const handleStageChange = (stageId) => {
    setSelectedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId) 
        : [...prev, stageId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/work-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: selectedProduct,
        quantity,
        stages: selectedStages,
      }),
    });

    if (res.ok) {
      router.push('/work-orders');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add Work Order</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a product</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Production Stages</label>
          <div className="mt-2 space-y-2">
            {stages.map(stage => (
              <div key={stage._id} className="flex items-center">
                <input
                  id={`stage-${stage._id}`}
                  type="checkbox"
                  checked={selectedStages.includes(stage._id)}
                  onChange={() => handleStageChange(stage._id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`stage-${stage._id}`} className="ml-3 block text-sm font-medium text-gray-700">
                  {stage.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Work Order
        </button>
      </form>
    </div>
  );
}
