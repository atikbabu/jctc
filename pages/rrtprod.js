// /pages/production.js
import { useEffect, useState } from 'react';

export default function ProductionPage() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    productName: '',
    wages: '',
    quantityProduced: 1,
    rawMaterials: []
  });
  const [productions, setProductions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchProductions();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    const data = await res.json();
    setMaterials(data);
  };

  const fetchProductions = async () => {
    const res = await fetch('/api/production');
    const data = await res.json();
    setProductions(data);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...form.rawMaterials];
    updated[index][field] = value;
    setForm({ ...form, rawMaterials: updated });
  };

  const addMaterialRow = () => {
    setForm({ ...form, rawMaterials: [...form.rawMaterials, { materialId: '', quantityUsed: '' }] });
  };

  const removeMaterialRow = (index) => {
    const updated = [...form.rawMaterials];
    updated.splice(index, 1);
    setForm({ ...form, rawMaterials: updated });
  };

  const uploadBase64Image = async (base64, filename) => {
    try {
      await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filename, base64 }),
      });
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const filename = `${Date.now()}_${file.name}`;
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePath = `/uploads/${filename}`;
        localStorage.setItem('product_image', imagePath);
        uploadBase64Image(reader.result, filename);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imagePath = localStorage.getItem('product_image') || '';
    const res = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, image: imagePath })
    });

    if (res.ok) {
      setMessage('✅ Production recorded successfully.');
      setForm({ productName: '', wages: '', quantityProduced: 1, rawMaterials: [] });
      fetchProductions();
      fetchMaterials();
    } else {
      const error = await res.json();
      setMessage(`❌ Error: ${error.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Production Management</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input type="text" name="productName" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Wages</label>
            <input type="number" name="wages" value={form.wages} onChange={(e) => setForm({ ...form, wages: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity Produced</label>
            <input type="number" name="quantityProduced" value={form.quantityProduced} onChange={(e) => setForm({ ...form, quantityProduced: e.target.value })} min="1" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-4">Raw Materials Used</h2>
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
              placeholder="Qty per unit"
              value={rm.quantityUsed}
              onChange={(e) => handleMaterialChange(idx, 'quantityUsed', e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button type="button" onClick={() => removeMaterialRow(idx)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addMaterialRow} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          + Add Material
        </button>

        <div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Record Production
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-2 mt-4">Production History</h2>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Wages</th>
              <th className="border p-2">Total Cost</th>
              <th className="border p-2">Final Price</th>
            </tr>
          </thead>
          <tbody>
            {productions.map((prod) => (
              <tr key={prod._id}>
                <td className="border p-2 text-left">{prod.productName}</td>
                <td className="border p-2 text-center">{prod.quantityProduced}</td>
                <td className="border p-2 text-center">{prod.wages}</td>
                <td className="border p-2 text-center">{prod.totalCost}</td>
                <td className="border p-2 text-center">{prod.finalPrice}</td>
              </tr>
            ))}
            {productions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">No production records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
