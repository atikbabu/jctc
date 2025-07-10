import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function MaterialListPage() {
  const [materials, setMaterials] = useState([]);
  const printableRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    if (res.status === 403) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setMaterials(data);
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
    doc.text('Material List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Name', 'Stock', 'Unit'];
    const rows = materials.map(mat => [
      mat.name,
      mat.quantityInStock,
      mat.unit,
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

    doc.save(`material-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Name', 'Stock', 'Unit'];
    const rows = materials.map(mat => [
      `"${mat.name}"`,
      `"${mat.quantityInStock}"`,
      `"${mat.unit}"`,
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
      link.setAttribute("download", "materials.csv");
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
        <h1 className="text-2xl font-semibold">Material List</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-center">Stock</th>
              <th className="border p-2 text-center">Unit</th>
              <th className="border p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat) => (
              <tr key={mat._id}>
                <td className="border p-2">{mat.name}</td>
                <td className="border p-2 text-center">{mat.quantityInStock}</td>
                <td className="border p-2 text-center">{mat.unit}</td>
                <td className="border p-2 text-center no-print">
                  <Link href={`/materials/${mat._id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">No materials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/materials/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Material
        </Link>
      </div>
    </div>
  );
}