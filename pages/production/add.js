// /pages/production/add.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AddProductionPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    productName: '',
    laborCostPerUnit: '',
    overheadCostPerUnit: '',
    rawMaterials: []
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    const data = await res.json();
    setMaterials(data);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...form.rawMaterials];
    updated[index][field] = value;
    setForm({ ...form, rawMaterials: updated });
  };

  const addMaterialRow = () => {
    setForm({ ...form, rawMaterials: [...form.rawMaterials, { materialId: '', quantityUsed: '' }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form };
    const res = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMessage('✅ Production recorded successfully');
      setTimeout(() => router.push('/production'), 1000);
    } else {
      const error = await res.json();
      setMessage(`❌ Error: ${error.error}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add Production</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Product Name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required className="border p-2 rounded" />
          <input type="number" placeholder="Labor Cost Per Unit" value={form.laborCostPerUnit} onChange={(e) => setForm({ ...form, laborCostPerUnit: e.target.value })} className="border p-2 rounded" />
          <input type="number" placeholder="Overhead Cost Per Unit" value={form.overheadCostPerUnit} onChange={(e) => setForm({ ...form, overheadCostPerUnit: e.target.value })} className="border p-2 rounded" />
        </div>

        <h2 className="text-lg font-semibold mt-4">Raw Materials</h2>
        {form.rawMaterials.map((rm, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <select
              value={rm.materialId}
              onChange={(e) => handleMaterialChange(idx, 'materialId', e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Select Material --</option>
              {materials.map((mat) => (
                <option key={mat._id} value={mat._id}>{mat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Qty Used"
              value={rm.quantityUsed}
              onChange={(e) => handleMaterialChange(idx, 'quantityUsed', e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
        ))}

        <button type="button" onClick={addMaterialRow} className="bg-blue-500 text-white px-3 py-1 rounded">
          + Add Material
        </button>

        <div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Record Production
          </button>
        </div>
      </form>
    </div>
  );
}
