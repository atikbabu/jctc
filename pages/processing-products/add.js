import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AddProcessingProductPage() {
  const router = useRouter();
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
    status: 'Active',
    category: '',
    subCategory: '',
  });
  const [materials, setMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [materialsRes, employeesRes, categoriesRes, subCategoriesRes] = await Promise.all([
        fetch('/api/materials', { credentials: 'include' }),
        fetch('/api/employees', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/subcategories', { credentials: 'include' }),
      ]);
      const materialsData = await materialsRes.json();
      const employeesData = await employeesRes.json();
      const categoriesData = await categoriesRes.json();
      const subCategoriesData = await subCategoriesRes.json();

      setMaterials(materialsData);
      setEmployees(employeesData);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
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
      const res = await fetch('/api/processing-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: finalImageUrl }),
      });

      if (res.ok) {
        setMessage('✅ Processing product added successfully');
        setTimeout(() => router.push('/processing-products'), 1000);
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

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add Processing Product</h1>

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
          <select
            id="cuttingStaff"
            name="cuttingStaff"
            value={form.cuttingStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Cutting Staff</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="embroideryStaff" className="block text-sm font-medium text-gray-700">Embroidery Staff</label>
          <select
            id="embroideryStaff"
            name="embroideryStaff"
            value={form.embroideryStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Embroidery Staff</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="packagingStaff" className="block text-sm font-medium text-gray-700">Packaging Staff</label>
          <select
            id="packagingStaff"
            name="packagingStaff"
            value={form.packagingStaff}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Packaging Staff</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>
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

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Processing Product
        </button>
      </form>
    </div>
  );
}
