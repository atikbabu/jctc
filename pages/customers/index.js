// /pages/customers/index.js
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const printableRef = useRef();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
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
    doc.text('Customer List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Name', 'Email', 'Phone', 'Address', 'Type', 'Company', 'Notes'];
    const rows = customers.map(c => [
      c.name,
      c.email || 'N/A',
      c.phone,
      c.address?.street ? `${c.address.street || ''}, ${c.address.city || ''}, ${c.address.postalCode || ''}, ${c.address.country || ''}` : (c.address || 'N/A'),
      c.customerType || 'N/A',
      c.companyName || 'N/A',
      c.notes || 'N/A',
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

    doc.save(`customer-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => alert('🔒 Excel export feature pending');

  const handlePrint = () => {
    const original = document.body.innerHTML;
    document.body.innerHTML = printableRef.current.innerHTML;
    window.print();
    document.body.innerHTML = original;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-semibold">Customer List</h1>
      </div>

      <div className="no-print flex gap-2">
        <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
        <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
        <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
      </div>

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Company</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan="8" className="p-4 text-center text-gray-500">No customers found.</td></tr>
            ) : customers.map(c => (
              <tr key={c._id}>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2">{c.email || 'N/A'}</td>
                <td className="border p-2">{c.phone}</td>
                <td className="border p-2">{c.address?.street ? `${c.address.street}, ${c.address.city}, ${c.address.postalCode}, ${c.address.country}` : (c.address || 'N/A')}</td>
                <td className="border p-2">{c.customerType || 'N/A'}</td>
                <td className="border p-2">{c.companyName || 'N/A'}</td>
                <td className="border p-2">{c.notes || 'N/A'}</td>
                <td className="border p-2 text-center">
                  <Link href={`/customers/${c._id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/customers/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Customer
        </Link>
      </div>
    </div>
  );
}
