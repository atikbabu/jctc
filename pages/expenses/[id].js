import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditExpensePage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    date: '',
    amount: 0,
    category: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchExpense = async () => {
        try {
          const res = await fetch(`/api/expenses/${id}`, { credentials: 'include' });
          if (res.status === 403) {
            router.push('/login');
            return;
          }
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch expense');
          }
          const data = await res.json();
          setForm({
            date: new Date(data.date).toISOString().split('T')[0],
            amount: data.amount,
            category: data.category,
            description: data.description || '',
          });
        } catch (error) {
          setMessage(`❌ Error fetching expense: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      if (res.ok) {
        setMessage('✅ Expense updated successfully');
        setTimeout(() => router.push('/expenses'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading expense...</div>;
  }

  if (message && message.startsWith('❌ Error fetching expense')) {
    return <div className="p-6 text-red-500">{message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Expense</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
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
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Expense
          </button>
          <Link href="/expenses" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
