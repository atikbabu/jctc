import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    role: '',
    rank: '',
    contactNumber: '',
    address: '',
    dateOfJoining: '',
    isActive: true,
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

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
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: finalImageUrl }),
      });

      if (res.ok) {
        setMessage('✅ Employee added successfully');
        setTimeout(() => router.push('/employees'), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Employee</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-gray-700">Rank</label>
          <input
            type="text"
            id="rank"
            name="rank"
            value={form.rank}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">Date of Joining</label>
          <input
            type="date"
            id="dateOfJoining"
            name="dateOfJoining"
            value={form.dateOfJoining}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
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
          Add Employee
        </button>
      </form>
    </div>
  );
}
