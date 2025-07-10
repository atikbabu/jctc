import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditFinishedProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    processingProduct: '',
    finishedCode: '',
    finishedDate: '',
    productType: '',
    sizes: [{ size: '', quantity: 0 }],
    imageUrl: '',
    price: 0,
    category: '',
    subCategory: '',
  });
  const [processingProducts, setProcessingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchFinishedProduct = async () => {
        try {
          const [res, categoriesRes, subCategoriesRes] = await Promise.all([
            fetch(`/api/finished-products/${id}`, { credentials: 'include' }),
            fetch('/api/categories', { credentials: 'include' }),
            fetch('/api/subcategories', { credentials: 'include' }),
          ]);

          if (!res.ok) {
            throw new Error('Failed to fetch finished product');
          }
          const data = await res.json();

          const categoriesData = await categoriesRes.json();
          const subCategoriesData = await subCategoriesRes.json();

          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : []);

          setForm({
            ...data,
            processingProduct: data.processingProduct?._id || '',
            finishedDate: data.finishedDate ? new Date(data.finishedDate).toISOString().split('T')[0] : '',
            category: data.category?._id || '',
            subCategory: data.subCategory?._id || '',
          });
        } catch (error) {
          setMessage(`❌ Network error: ${error.message}`);
        }
      };
      fetchFinishedProduct();
    }

    const fetchProcessingProducts = async () => {
      const res = await fetch('/api/processing-products', { credentials: 'include' });
      const data = await res.json();
      setProcessingProducts(data.filter(p => p.status === 'Completed'));
    };
    fetchProcessingProducts();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/finished-products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage('✅ Finished product updated successfully');
        setTimeout(() => router.push('/finished-products'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this finished product?')) {
      try {
        const res = await fetch(`/api/finished-products/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setMessage('✅ Finished product deleted successfully');
          setTimeout(() => router.push('/finished-products'), 1000);
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
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
      ...(name === 'category' && { subCategory: '' }), // Reset subCategory when category changes
    }));
  };

  const handleSizeChange = (index, e) => {
    const { name, value } = e.target;
    const newSizes = [...form.sizes];
    newSizes[index] = { ...newSizes[index], [name]: name === 'quantity' ? Number(value) : value };
    setForm({ ...form, sizes: newSizes });
  };

  const addSizeField = () => {
    setForm({ ...form, sizes: [...form.sizes, { size: '', quantity: 0 }] });
  };

  const removeSizeField = (index) => {
    const newSizes = form.sizes.filter((_, i) => i !== index);
    setForm({ ...form, sizes: newSizes });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Finished Product</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="processingProduct" className="block text-sm font-medium text-gray-700">Processing Product (Completed)</label>
          <select
            id="processingProduct"
            name="processingProduct"
            value={form.processingProduct}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a completed processing product</option>
            {processingProducts.map((product) => (
              <option key={product._id} value={product._id}>
                {product.processingCode} (Started: {new Date(product.startDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="finishedCode" className="block text-sm font-medium text-gray-700">Finished Code</label>
          <input
            type="text"
            id="finishedCode"
            name="finishedCode"
            value={form.finishedCode}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="finishedDate" className="block text-sm font-medium text-gray-700">Finished Date</label>
          <input
            type="date"
            id="finishedDate"
            name="finishedDate"
            value={form.finishedDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="productType" className="block text-sm font-medium text-gray-700">Product Type</label>
          <select
            id="productType"
            name="productType"
            value={form.productType}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Formal">Formal</option>
            <option value="Text">Text</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sizes & Quantities</label>
          {form.sizes.map((sizeEntry, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                name="size"
                placeholder="Size (e.g., S, M, L, XL)"
                value={sizeEntry.size}
                onChange={(e) => handleSizeChange(index, e)}
                className="flex-1 border p-2 rounded"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={sizeEntry.quantity}
                onChange={(e) => handleSizeChange(index, e)}
                className="w-24 border p-2 rounded"
                required
                min="0"
              />
              <button
                type="button"
                onClick={() => removeSizeField(index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeField}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Size
          </button>
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
            placeholder="e.g., /uploads/finished-product.jpg"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">Sub Category</label>
          <select
            id="subCategory"
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!form.category}
          >
            <option value="">Select a Sub Category</option>
            {subCategories
              .filter(subCat => subCat.category === form.category)
              .map((subCat) => (
                <option key={subCat._id} value={subCat._id}>
                  {subCat.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Finished Product
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Finished Product
          </button>
        </div>
      </form>
    </div>
  );
}
