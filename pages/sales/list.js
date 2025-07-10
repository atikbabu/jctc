import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function SalesListPage() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const printableRef = useRef();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const res = await fetch('/api/sales');
    const data = await res.json();
    setSales(data);
  };

  const filtered = sales.filter(sale => {
    return sale.items.some(item => item.finishedGood.finishedCode.toLowerCase().includes(search.toLowerCase()));
  });

  const handleExportPDF = async () => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Jhinuk Crafting & Training Center (JC & TC)', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Sales List / Invoices', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Date', 'Items', 'Payment', 'Total'];
    const rows = filtered.map(sale => [
      new Date(sale.createdAt).toLocaleString(),
      sale.items.map(item => `${item.finishedGood?.finishedCode || 'N/A'} (${item.size || 'N/A'}) x ${item.quantity || 'N/A'}`).join(', '),
      sale.paymentMethod,
      `৳ ${sale.total.toFixed(2)}`,
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

    doc.save(`sales-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Items', 'Payment', 'Total'];
    const rows = filtered.map(sale => [
      `"${new Date(sale.createdAt).toLocaleString()}"`,
      `"${sale.items.map(item => `${item.finishedGood.finishedCode} (${item.size}) x ${item.quantity}`).join('; ')}"`,
      `"${sale.paymentMethod}"`,
      `"${sale.total.toFixed(2)}"`,
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
      link.setAttribute("download", "sales-list.csv");
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
        <h1 className="text-2xl font-semibold">Sales List / Invoices</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search product name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 border p-2 rounded"
      />

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border-collapse text-sm mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2">Total</th>
              <th className="border p-2 no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">{new Date(sale.createdAt).toLocaleString()}</td>
                <td className="border p-2">
                  <ul className="list-disc list-inside">
                    {sale.items.map((item, i) => (
                      <li key={i}>{item.finishedGood.finishedCode} ({item.size}) x {item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td className="border p-2">{sale.paymentMethod}</td>
                <td className="border p-2">৳ {sale.total.toFixed(2)}</td>
                <td className="border p-2 text-center no-print">
                  <button
                    onClick={() => router.push(`/sales/invoice/${sale._id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Invoice
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">No sales found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}