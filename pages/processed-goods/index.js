import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function ProcessedGoods() {
  const [processedGoods, setProcessedGoods] = useState([]);
  const [message, setMessage] = useState(null);
  const printableRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetchProcessedGoods();
  }, []);

  const fetchProcessedGoods = async () => {
    try {
      const res = await fetch('/api/processed-goods');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch processed goods');
      }
      const data = await res.json();
      setProcessedGoods(data.data);
    } catch (error) {
      setMessage(`❌ Error fetching processed goods: ${error.message}`);
      setProcessedGoods([]);
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
    doc.text('Processed Goods (Work-in-Progress)', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Work Order', 'Product', 'Quantity', 'Current Stage'];
    const rows = processedGoods.map(item => [
      item.workOrder?.orderNumber || 'N/A',
      item.product?.name || 'N/A',
      item.quantity,
      item.currentStage?.name || 'N/A',
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

    doc.save(`processed-goods-report-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Work Order', 'Product', 'Quantity', 'Current Stage'];
    const rows = processedGoods.map(item => [
      `"${item.workOrder?.orderNumber || 'N/A'}"`,
      `"${item.product?.name || 'N/A'}"`,
      `"${item.quantity}"`,
      `"${item.currentStage?.name || 'N/A'}"`,
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
      link.setAttribute("download", "processed-goods.csv");
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
        <h1 className="text-2xl font-semibold">Processed Goods (Work-in-Progress)</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div ref={printableRef} className="overflow-x-auto bg-white p-4 rounded shadow printable-content">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedGoods.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workOrder?.orderNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentStage?.name || 'N/A'}</td>
              </tr>
            ))}
            {processedGoods.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">No processed goods found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}