// /pages/materials/add.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantityInStock: 0,
    reorderLevel: 0,
    costPerUnit: 0,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'quantityInStock' || name === 'reorderLevel' || name === 'costPerUnit' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error('Failed to add material');
      }
      router.push('/materials');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Material</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
          <input
            type="text"
            name="unit"
            id="unit"
            value={formData.unit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="quantityInStock" className="block text-sm font-medium text-gray-700">Quantity In Stock</label>
          <input
            type="number"
            name="quantityInStock"
            id="quantityInStock"
            value={formData.quantityInStock}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level</label>
          <input
            type="number"
            name="reorderLevel"
            id="reorderLevel"
            value={formData.reorderLevel}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700">Cost Per Unit</label>
          <input
            type="number"
            name="costPerUnit"
            id="costPerUnit"
            value={formData.costPerUnit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Material
          </button>
          <Link href="/materials" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}