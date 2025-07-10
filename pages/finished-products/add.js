import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AddFinishedProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    processingProduct: '',
    finishedCode: '',
    finishedDate: '',
    productType: 'Other',
    sizes: [{ size: '', quantity: 0 }],
    imageUrl: '',
    price: 0, // Added price field
    category: '',
    subCategory: '',
  });
  const [processingProducts, setProcessingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [processingRes, categoriesRes, subCategoriesRes] = await Promise.all([
          fetch('/api/processing-products', { credentials: 'include' }),
          fetch('/api/categories', { credentials: 'include' }),
          fetch('/api/subcategories', { credentials: 'include' }),
        ]);

        if (processingRes.status === 403 || categoriesRes.status === 403 || subCategoriesRes.status === 403) {
          router.push('/login');
          return;
        }

        const processingData = await processingRes.json();
        const categoriesData = await categoriesRes.json();
        const subCategoriesData = await subCategoriesRes.json();

        if (Array.isArray(processingData)) {
          setProcessingProducts(processingData.filter(p => p.status === 'Completed'));
        } else {
          console.error('API returned non-array data for processing products:', processingData);
          setProcessingProducts([]);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          console.error('API returned non-array data for categories:', categoriesData);
          setCategories([]);
        }

        if (Array.isArray(subCategoriesData)) {
          setSubCategories(subCategoriesData);
        } else {
          console.error('API returned non-array data for subcategories:', subCategoriesData);
          setSubCategories([]);
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setMessage(`❌ Error fetching initial data: ${error.message}`);
        setProcessingProducts([]);
        setCategories([]);
        setSubCategories([]);
      }
    };
    fetchInitialData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set for immediate preview
        setForm((prevForm) => ({
          ...prevForm,
          imageFile: file, // Store the file object itself
          imageUrl: '', // Clear imageUrl when a new file is selected
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
      setForm((prevForm) => ({
        ...prevForm,
        imageFile: null,
        imageUrl: '', // Clear imageUrl when no file is selected
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    let finalImageUrl = form.imageUrl;

    if (form.imageFile) {
      const formData = new FormData();
      formData.append('image', form.imageFile);

      try {
        const uploadRes = await fetch('/api/save-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }
        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.imageUrl; // Assuming the API returns the URL
      } catch (uploadError) {
        setMessage(`❌ Image upload failed: ${uploadError.message}`);
        return;
      }
    }

    try {
      const res = await fetch('/api/finished-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: finalImageUrl }),
      });

      if (res.ok) {
        setMessage('✅ Finished product added successfully');
        setTimeout(() => router.push('/finished-products'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
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
      <h1 className="text-2xl font-bold">Add Finished Product</h1>

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

        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
          <input
            type="file"
            id="imageUpload"
            name="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imagePreviewUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Image Preview:</p>
              <img src={imagePreviewUrl} alt="Image Preview" className="mt-1 max-w-xs h-auto rounded-md" />
            </div>
          )}
          {form.imageFile && !form.imageUrl && (
            <p className="mt-2 text-sm text-gray-500">Selected File: {form.imageFile.name}</p>
          )}
          {form.imageUrl && (
            <p className="mt-2 text-sm text-gray-500">Uploaded Image: {form.imageUrl.split('/').pop()}</p>
          )}
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

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Finished Product
        </button>
      </form>
    </div>
  );
}
