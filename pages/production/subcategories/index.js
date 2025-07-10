import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';


export default function SubCategoryListPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState(null);
  const printableRef = useRef();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const res = await fetch('/api/subcategories', { credentials: 'include' });
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch subcategories');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubCategories(data);
      } else {
        console.error('API returned non-array data:', data);
        setSubCategories([]);
      }
    } catch (error) {
      setMessage(`❌ Error fetching subcategories: ${error.message}`);
      setSubCategories([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const res = await fetch(`/api/subcategories/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          setMessage('✅ SubCategory deleted successfully');
          fetchSubCategories();
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting subcategory: ${err.error || 'Something went wrong'}`);
        }
      } catch (error) {
        setMessage(`❌ Network error: ${error.message}`);
      }
    }
  };

  const handleExportPDF = async () => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Jhinuk Crafting & Training Center (JC & TC)', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.text('SubCategory List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Name', 'Category', 'Description'];
    const rows = subCategories.map(subCategory => [
      subCategory.name,
      subCategory.category?.name || 'N/A',
      subCategory.description || 'N/A',
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 100,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [30, 144, 255] },
      margin: { left: 40, right: 40 }
    });

    doc.save(`subcategory-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Name', 'Category', 'Description'];
    const rows = subCategories.map(subCategory => [
      `"${subCategory.name}"`,
      `"${subCategory.category?.name || 'N/A'}"`,
      `"${subCategory.description || 'N/A'}"`,
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "subcategories.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    const original = document.body.innerHTML;
    document.body.innerHTML = printableRef.current.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload(); // Reload to restore original page content and functionality
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-semibold">SubCategories</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory) => (
              <tr key={subCategory._id}>
                <td className="border border-gray-300 p-2">{subCategory.name}</td>
                <td className="border border-gray-300 p-2">{subCategory.category?.name || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{subCategory.description || 'N/A'}</td>
                <td className="border border-gray-300 p-2 relative text-center no-print">
                  <button
                    onClick={() => toggleMenu(subCategory._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === subCategory._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/production/subcategories/${subCategory._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(subCategory._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {subCategories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">No subcategories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/production/subcategories/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add SubCategory
        </Link>
      </div>
    </div>
  );
}