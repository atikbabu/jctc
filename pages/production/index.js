// /pages/production/index.js
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductionListPage() {
  const [productions, setProductions] = useState([]);
  const printableRef = useRef();

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    const res = await fetch('/api/production');
    const data = await res.json();
    setProductions(data);
  };

  const handlePrint = () => {
    const original = document.body.innerHTML;
    const printContent = printableRef.current.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = original;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Jhinuk Crafting & Training Center (JC & TC)', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Production List', pageWidth / 2, 60, { align: 'center' });

    // Generated date
    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table
    const columns = [
      'Product', 'Qty', 'Wages', 'Cutting', 'Sewing', 'Coloring', 'Materials Cost', 'Total Cost', 'Final Price (VAT)'
    ];
    const rows = productions.map(p => [
      p.productName,
      p.quantityProduced,
      p.wages || 0,
      p.cutting || 0,
      p.sewing || 0,
      p.coloring || 0,
      p.materialsCost || 0,
      p.totalCost || 0,
      p.finalPrice || 0
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

    doc.save(`production-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    alert('🔒 Excel export feature pending');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-semibold">Production List</h1>
        <Link href="/production/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Production
        </Link>
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
              <th className="border p-2">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Wages</th>
              <th className="border p-2">Cutting</th>
              <th className="border p-2">Sewing</th>
              <th className="border p-2">Coloring</th>
              <th className="border p-2">Materials Cost</th>
              <th className="border p-2">Total Cost</th>
              <th className="border p-2">Final Price (VAT)</th>
            </tr>
          </thead>
          <tbody>
            {productions.length === 0 ? (
              <tr><td colSpan="9" className="p-4 text-center text-gray-500">No production records.</td></tr>
            ) : productions.map(prod => (
              <tr key={prod._id}>
                <td className="border p-2">{prod.productName}</td>
                <td className="border p-2 text-center">{prod.quantityProduced}</td>
                <td className="border p-2 text-center">{prod.wages || 0}</td>
                <td className="border p-2 text-center">{prod.cutting || 0}</td>
                <td className="border p-2 text-center">{prod.sewing || 0}</td>
                <td className="border p-2 text-center">{prod.coloring || 0}</td>
                <td className="border p-2 text-center">{prod.materialsCost || 0}</td>
                <td className="border p-2 text-center">{prod.totalCost || 0}</td>
                <td className="border p-2 text-center font-semibold">{prod.finalPrice || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
