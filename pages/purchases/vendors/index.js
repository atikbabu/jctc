import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';


export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState(null);
  const printableRef = useRef();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch vendors');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setVendors(data);
      } else {
        console.error('API returned non-array data:', data);
        setVendors([]);
      }
    } catch (error) {
      setMessage(`❌ Error fetching vendors: ${error.message}`);
      setVendors([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const res = await fetch(`/api/vendors/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('✅ Vendor deleted successfully');
          fetchVendors();
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting vendor: ${err.error || 'Something went wrong'}`);
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
    doc.text('Vendor List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Name', 'Contact Person', 'Phone', 'Email', 'Address'];
    const rows = vendors.map(vendor => [
      vendor.name,
      vendor.contactPerson || 'N/A',
      vendor.phone || 'N/A',
      vendor.email || 'N/A',
      vendor.address || 'N/A',
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

    doc.save(`vendor-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Name', 'Contact Person', 'Phone', 'Email', 'Address'];
    const rows = vendors.map(vendor => [
      `"${vendor.name}"`,
      `"${vendor.contactPerson || 'N/A'}"`,
      `"${vendor.phone || 'N/A'}"`,
      `"${vendor.email || 'N/A'}"`,
      `"${vendor.address || 'N/A'}"`,
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
      link.setAttribute("download", "vendors.csv");
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
        <h1 className="text-2xl font-semibold">Vendor List</h1>
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
              <th className="border border-gray-300 p-2 text-left">Contact Person</th>
              <th className="border border-gray-300 p-2 text-left">Phone</th>
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Address</th>
              <th className="border border-gray-300 p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id}>
                <td className="border border-gray-300 p-2">{vendor.name}</td>
                <td className="border border-gray-300 p-2">{vendor.contactPerson || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{vendor.phone || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{vendor.email || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{vendor.address || 'N/A'}</td>
                <td className="border border-gray-300 p-2 relative text-center no-print">
                  <button
                    onClick={() => toggleMenu(vendor._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === vendor._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/purchases/vendors/${vendor._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(vendor._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">No vendors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/purchases/vendors/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Vendor
        </Link>
      </div>
    </div>
  );
}