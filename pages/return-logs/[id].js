import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditReturnLogPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    finishedProduct: '',
    quantity: 1,
    reason: '',
    returnDate: '',
  });
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchReturnLog = async () => {
        try {
          const res = await fetch(`/api/return-logs/${id}`);
          if (res.ok) {
            const data = await res.json();
            setForm({
              ...data,
              finishedProduct: data.finishedProduct?._id || '',
              returnDate: data.returnDate ? new Date(data.returnDate).toISOString().split('T')[0] : '',
            });
          } else {
            setMessage('❌ Failed to fetch return log');
          }
        } catch (error) {
          setMessage(`❌ Network error: ${error.message}`);
        }
      };
      fetchReturnLog();
    }

    const fetchFinishedProducts = async () => {
      const res = await fetch('/api/finished-products');
      const data = await res.json();
      setFinishedProducts(data);
    };
    fetchFinishedProducts();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/return-logs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage('✅ Return log updated successfully');
        setTimeout(() => router.push('/return-logs'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this return log?')) {
      try {
        const res = await fetch(`/api/return-logs/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setMessage('✅ Return log deleted successfully');
          setTimeout(() => router.push('/return-logs'), 1000);
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
      <h1 className="text-2xl font-bold">Edit Return Log</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="finishedProduct" className="block text-sm font-medium text-gray-700">Finished Product</label>
          <select
            id="finishedProduct"
            name="finishedProduct"
            value={form.finishedProduct}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a finished product</option>
            {finishedProducts.map((product) => (
              <option key={product._id} value={product._id}>
                {product.finishedCode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Return</label>
          <textarea
            id="reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows="3"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Return Date</label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={form.returnDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Return Log
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Return Log
          </button>
        </div>
      </form>
    </div>
  );
}
