import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AddFinishedGoodPage() {
  const router = useRouter();
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [selectedFinishedProduct, setSelectedFinishedProduct] = useState(null);
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFinishedProducts = async () => {
      try {
        const res = await fetch('/api/finished-products', { credentials: 'include' });
        if (res.status === 403) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setFinishedProducts(data);
        } else {
          console.error('API returned non-array data for finished products:', data);
          setFinishedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching finished products:', error);
        setMessage(`❌ Error fetching finished products: ${error.message}`);
      }
    };
    fetchFinishedProducts();
  }, []);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = finishedProducts.find(p => p._id === productId);
    setSelectedFinishedProduct(product);
    // Initialize quantities for each size to 0
    const initialQuantities = {};
    if (product && product.sizes) {
      product.sizes.forEach(s => {
        initialQuantities[s.size] = 0;
      });
    }
    setSizeQuantities(initialQuantities);
    setCostPerUnit(product ? product.price : 0); // Pre-fill cost with product's price
  };

  const handleQuantityChange = (size, value) => {
    setSizeQuantities(prev => ({
      ...prev,
      [size]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedFinishedProduct) {
      setMessage('❌ Please select a finished product.');
      return;
    }

    const itemsToAdd = [];
    for (const size in sizeQuantities) {
      const quantity = sizeQuantities[size];
      if (quantity > 0) {
        itemsToAdd.push({
          finishedProduct: selectedFinishedProduct._id,
          size,
          quantity,
          cost: costPerUnit, // Use the cost per unit from the form
        });
      }
    }

    if (itemsToAdd.length === 0) {
      setMessage('❌ Please enter quantity for at least one size.');
      return;
    }

    try {
      const res = await fetch('/api/finished-goods/add-multiple', { // New API endpoint for multiple additions
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd }),
      });

      if (res.ok) {
        setMessage('✅ Finished goods added successfully!');
        setTimeout(() => router.push('/finished-goods'), 1000);
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
      <h1 className="text-2xl font-bold">Add Finished Good to Inventory</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="finishedProductSelect" className="block text-sm font-medium text-gray-700">Select Finished Product</label>
          <select
            id="finishedProductSelect"
            name="finishedProductSelect"
            onChange={handleProductSelect}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a finished product</option>
            {finishedProducts.map((product) => (
              <option key={product._id} value={product._id}>
                {product.finishedCode} (Price: {product.price})
              </option>
            ))}
          </select>
        </div>

        {selectedFinishedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantities by Size</label>
              {selectedFinishedProduct.sizes.map(s => (
                <div key={s.size} className="flex items-center mt-2">
                  <label htmlFor={`quantity-${s.size}`} className="w-24 text-sm font-medium text-gray-700">{s.size}:</label>
                  <input
                    type="number"
                    id={`quantity-${s.size}`}
                    value={sizeQuantities[s.size] || 0}
                    onChange={(e) => handleQuantityChange(s.size, e.target.value)}
                    min="0"
                    className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700">Cost per Unit (for all sizes)</label>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add to Finished Goods
        </button>
      </form>
    </div>
  );
}