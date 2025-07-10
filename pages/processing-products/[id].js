import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditProcessingProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    purchasedProduct: '',
    processingCode: '',
    cuttingStaff: '',
    embroideryStaff: '',
    packagingStaff: '',
    startDate: '',
    endDate: '',
    notes: '',
    imageUrl: '',
    status: '',
    category: '',
    subCategory: '',
  });
  const [materials, setMaterials] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProcessingProduct = async () => {
        try {
          const res = await fetch(`/api/processing-products/${id}`);
          if (res.ok) {
            const data = await res.json();
            setForm({
              ...data,
              purchasedProduct: data.purchasedProduct?._id || '',
              startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
              endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
            });
          } else {
            setMessage('❌ Failed to fetch processing product');
          }
        } catch (error) {
          setMessage(`❌ Network error: ${error.message}`);
        }
      };
      fetchProcessingProduct();
    }

    const fetchMaterials = async () => {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(data);
    };
    fetchMaterials();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/processing-products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage('✅ Processing product updated successfully');
        setTimeout(() => router.push('/processing-products'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this processing product?')) {
      try {
        const res = await fetch(`/api/processing-products/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setMessage('✅ Processing product deleted successfully');
          setTimeout(() => router.push('/processing-products'), 1000);
        } else {
          const err = await res.json();
          setMessage(`❌ ${err.error || 'Something went wrong'}`);
        }
      } catch (error) {
        setMessage(`❌ Network error: ${error.message}`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Processing Product</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="purchasedProduct" className="block text-sm font-medium text-gray-700">Purchased Product</label>
          <select
            id="purchasedProduct"
            name="purchasedProduct"
            value={form.purchasedProduct}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a purchased product</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.name} ({material.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="processingCode" className="block text-sm font-medium text-gray-700">Processing Code</label>
          <input
            type="text"
            id="processingCode"
            name="processingCode"
            value={form.processingCode}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="cuttingStaff" className="block text-sm font-medium text-gray-700">Cutting Staff</label>
          <input
            type="text"
            id="cuttingStaff"
            name="cuttingStaff"
            value={form.cuttingStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="embroideryStaff" className="block text-sm font-medium text-gray-700">Embroidery Staff</label>
          <input
            type="text"
            id="embroideryStaff"
            name="embroideryStaff"
            value={form.embroideryStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="packagingStaff" className="block text-sm font-medium text-gray-700">Packaging Staff</label>
          <input
            type="text"
            id="packagingStaff"
            name="packagingStaff"
            value={form.packagingStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
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
            value={form.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">Sub Category</label>
          <input
            type="text"
            id="subCategory"
            name="subCategory"
            value={form.subCategory}
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
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="cuttingCost" className="block text-sm font-medium text-gray-700">Cutting Cost</label>
          <input
            type="number"
            id="cuttingCost"
            name="cuttingCost"
            value={form.cuttingCost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="embroideryCost" className="block text-sm font-medium text-gray-700">Embroidery Cost</label>
          <input
            type="number"
            id="embroideryCost"
            name="embroideryCost"
            value={form.embroideryCost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="packagingCost" className="block text-sm font-medium text-gray-700">Packaging Cost</label>
          <input
            type="number"
            id="packagingCost"
            name="packagingCost"
            value={form.packagingCost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="otherProcessingCosts" className="block text-sm font-medium text-gray-700">Other Processing Costs</label>
          <input
            type="number"
            id="otherProcessingCosts"
            name="otherProcessingCosts"
            value={form.otherProcessingCosts}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., /uploads/image.jpg"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Processing Product
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Processing Product
          </button>
        </div>
      </form>
    </div>
  );
}
