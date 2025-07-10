import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditSalaryStructurePage() {
  const router = useRouter();
  const { id } = router.query;
  const [structure, setStructure] = useState(null);
  const [form, setForm] = useState({
    rank: '',
    basicPay: 0,
    houseRentAllowance: 0,
    medicalAllowance: 0,
    conveyanceAllowance: 0,
    overtimeAllowancePerHour: 0,
    maxSkillsBonus: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchSalaryStructure();
    }
  }, [id]);

  const fetchSalaryStructure = async () => {
    try {
      const res = await fetch(`/api/salary-structures/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch salary structure');
      }
      const data = await res.json();
      setStructure(data);
      setForm({
        rank: data.rank,
        basicPay: data.basicPay,
        houseRentAllowance: data.houseRentAllowance,
        medicalAllowance: data.medicalAllowance,
        conveyanceAllowance: data.conveyanceAllowance,
        overtimeAllowancePerHour: data.overtimeAllowancePerHour,
        maxSkillsBonus: data.maxSkillsBonus,
      });
    } catch (err) {
      setMessage(`❌ Error fetching salary structure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) || value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/salary-structures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('✅ Salary structure updated successfully');
        setTimeout(() => router.push('/hrm/salary-structures'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (message && message.startsWith('❌ Error fetching salary structure')) {
    return <div className="p-6 text-red-500">{message}</div>;
  }

  if (!structure) {
    return <div className="p-6">Salary structure not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Salary Structure</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-gray-700">Rank</label>
          <input
            type="text"
            id="rank"
            name="rank"
            value={form.rank}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="basicPay" className="block text-sm font-medium text-gray-700">Basic Pay</label>
          <input
            type="number"
            id="basicPay"
            name="basicPay"
            value={form.basicPay}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="houseRentAllowance" className="block text-sm font-medium text-gray-700">House Rent Allowance</label>
          <input
            type="number"
            id="houseRentAllowance"
            name="houseRentAllowance"
            value={form.houseRentAllowance}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="medicalAllowance" className="block text-sm font-medium text-gray-700">Medical Allowance</label>
          <input
            type="number"
            id="medicalAllowance"
            name="medicalAllowance"
            value={form.medicalAllowance}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="conveyanceAllowance" className="block text-sm font-medium text-gray-700">Conveyance Allowance</label>
          <input
            type="number"
            id="conveyanceAllowance"
            name="conveyanceAllowance"
            value={form.conveyanceAllowance}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="overtimeAllowancePerHour" className="block text-sm font-medium text-gray-700">Overtime Allowance Per Hour</label>
          <input
            type="number"
            id="overtimeAllowancePerHour"
            name="overtimeAllowancePerHour"
            value={form.overtimeAllowancePerHour}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="maxSkillsBonus" className="block text-sm font-medium text-gray-700">Maximum Skills Bonus</label>
          <input
            type="number"
            id="maxSkillsBonus"
            name="maxSkillsBonus"
            value={form.maxSkillsBonus}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Salary Structure
          </button>
          <Link href="/hrm/salary-structures" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
