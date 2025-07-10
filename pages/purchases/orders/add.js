import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    poNumber: '',
    vendor: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'Pending',
    notes: '',
    items: [{
      material: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      itemType: 'Material',
    }],
  });
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorsRes, materialsRes] = await Promise.all([
          fetch('/api/vendors', { credentials: 'include' }),
          fetch('/api/materials', { credentials: 'include' }),
        ]);

        if (vendorsRes.status === 403 || materialsRes.status === 403) {
          router.push('/login');
          return;
        }

        const vendorsData = await vendorsRes.json();
        const materialsData = await materialsRes.json();

        if (Array.isArray(vendorsData)) {
          setVendors(vendorsData);
        } else {
          console.error('API returned non-array data for vendors:', vendorsData);
          setVendors([]);
        }

        if (Array.isArray(materialsData)) {
          setMaterials(materialsData);
        } else {
          console.error('API returned non-array data for materials:', materialsData);
          setMaterials([]);
        }

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

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...form.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value,
    };
    setForm({ ...form, items: newItems });
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { material: '', description: '', quantity: 1, unitPrice: 0, itemType: 'Material' }] });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const processedItems = form.items.map(item => {
        const newItem = { ...item };
        if (newItem.itemType === 'Material') {
          // If material type, ensure materialId is set
          newItem.materialId = newItem.material; // Map material to materialId
          delete newItem.material; // Remove original material field
          if (newItem.materialId === '') {
            newItem.materialId = undefined;
          }
          // Description is optional for Material, so ensure it's not an empty string if not provided
          if (newItem.description === '') {
            newItem.description = undefined;
          }
        } else {
          // For non-material types, description is required
          if (newItem.description === '') {
            // This should ideally be caught by frontend validation, but as a fallback
            throw new Error('Description is required for non-Material items.');
          }
        }
        return newItem;
      });

      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vendor: form.vendor || undefined,
          items: processedItems,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        setMessage('✅ Purchase Order created successfully');
        setForm({
          poNumber: '',
          vendor: '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: '',
          status: 'Pending',
          notes: '',
          items: [{
            material: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            itemType: 'Material',
          }],
        });
        setTimeout(() => router.push('/purchases/orders'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}${err.details ? `: ${err.details}` : ''}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create New Purchase Order</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        <div>
          <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">PO Number</label>
          <input
            type="text"
            id="poNumber"
            name="poNumber"
            value={form.poNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
          <select
            id="vendor"
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">Order Date</label>
          <input
            type="date"
            id="orderDate"
            name="orderDate"
            value={form.orderDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700">Expected Delivery Date (Optional)</label>
          <input
            type="date"
            id="expectedDeliveryDate"
            name="expectedDeliveryDate"
            value={form.expectedDeliveryDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <h2 className="text-xl font-bold mt-6">Items</h2>
        {form.items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md relative">
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
            >
              X
            </button>
            <div>
              <label htmlFor={`itemType-${index}`} className="block text-sm font-medium text-gray-700">Item Type</label>
              <select
                id={`itemType-${index}`}
                name="itemType"
                value={item.itemType}
                onChange={(e) => handleItemChange(index, e)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Material">Material</option>
                <option value="Office Supply">Office Supply</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {item.itemType === 'Material' ? (
              <div>
                <label htmlFor={`material-${index}`} className="block text-sm font-medium text-gray-700">Material</label>
                <select
                  id={`material-${index}`}
                  name="material"
                  value={item.material}
                  onChange={(e) => handleItemChange(index, e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Material</option>
                  {materials.map((mat) => (
                    <option key={mat._id} value={mat._id}>
                      {mat.name} ({mat.unit})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  id={`description-${index}`}
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                id={`quantity-${index}`}
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                required
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700">Unit Price</label>
              <input
                type="number"
                id={`unitPrice-${index}`}
                name="unitPrice"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, e)}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddItem}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Item
        </button>

        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Purchase Order
          </button>
          <Link href="/purchases/orders" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}