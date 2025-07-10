import { useEffect, useState } from 'react';

export default function InventoryPage() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    name: '',
    unit: '',
    quantityInStock: '',
    reorderLevel: '',
    costPerUnit: '',
  });
  const [editingId, setEditingId] = useState(null);

  // New: Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    const data = await res.json();
    setMaterials(data);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/materials/${editingId}` : '/api/materials';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ name: '', unit: '', quantityInStock: '', reorderLevel: '', costPerUnit: '' });
    setEditingId(null);
    fetchMaterials();
  };

  const deleteMaterial = async (id) => {
    await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    fetchMaterials();
  };

  const startEdit = (mat) => {
    setForm({
      name: mat.name,
      unit: mat.unit,
      quantityInStock: mat.quantityInStock,
      reorderLevel: mat.reorderLevel,
      costPerUnit: mat.costPerUnit,
    });
    setEditingId(mat._id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', unit: '', quantityInStock: '', reorderLevel: '', costPerUnit: '' });
  };

  // 🔍 Filter + Paginate
  const filteredMaterials = materials.filter((mat) =>
    mat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Raw Materials Inventory</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        className="p-2 border rounded w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow">
        {['name', 'unit', 'quantityInStock', 'reorderLevel', 'costPerUnit'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type={field.includes('quantity') || field.includes('cost') ? 'number' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required={field === 'name' || field === 'unit'}
            />
          </div>
        ))}
        <div className="flex items-end space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            {editingId ? 'Update' : 'Add Material'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Reorder</th>
              <th className="border p-2">Cost/Unit</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMaterials.map((mat) => (
              <tr key={mat._id} className="text-sm text-center hover:bg-gray-50">
                <td className="border p-2 text-left">{mat.name}</td>
                <td className="border p-2 text-left">{mat.unit}</td>
                <td className="border p-2">{mat.quantityInStock}</td>
                <td className="border p-2">{mat.reorderLevel}</td>
                <td className="border p-2">{mat.costPerUnit}</td>
                <td className="border p-2 space-x-1">
                  <button onClick={() => startEdit(mat)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs">Edit</button>
                  <button onClick={() => deleteMaterial(mat._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {paginatedMaterials.length === 0 && (
              <tr><td colSpan="6" className="text-center text-gray-500 p-4">No materials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
