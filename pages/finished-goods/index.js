import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';

export default function FinishedGoods() {
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState(null);
  const printableRef = useRef();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchFinishedGoods();
  }, [router.asPath]);

  const fetchFinishedGoods = async () => {
    try {
      const res = await fetch('/api/finished-goods', { credentials: 'include' });
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch finished goods');
      }
      const data = await res.json();
      setFinishedGoods(data.data);
    } catch (error) {
      setMessage(`❌ Error fetching finished goods: ${error.message}`);
      setFinishedGoods([]);
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
    doc.text('Finished Goods Inventory', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Product', 'Category', 'SubCategory', 'Quantity', 'Cost', 'Date Added'];
    const rows = finishedGoods.map(item => [
      item.product?.finishedCode,
      item.category?.name || 'N/A',
      item.subCategory?.name || 'N/A',
      item.quantity,
      item.cost.toFixed(2),
      new Date(item.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 100,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [30, 144, 255] },
      margin: { left: 40, right: 40 }
    });

    doc.save(`finished-goods-inventory-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Product', 'Category', 'SubCategory', 'Quantity', 'Cost', 'Date Added'];
    const rows = finishedGoods.map(item => [
      `"${item.product?.finishedCode}"`,
      `"${item.category?.name || 'N/A'}"`,
      `"${item.subCategory?.name || 'N/A'}"`,
      `"${item.quantity}"`,
      `"${item.cost.toFixed(2)}"`,
      `"${new Date(item.createdAt).toLocaleDateString()}"`,
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
      link.setAttribute("download", "finished-goods-inventory.csv");
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
        <h1 className="text-2xl font-semibold">Finished Goods Inventory</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}
      
      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">SubCategory</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Date Added</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300 no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {finishedGoods.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">{item.product?.finishedCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{item.category?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{item.subCategory?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{item.cost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300 no-print">
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(item._id)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === item._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <Link href={`/finished-products/${item.product._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Edit
                        </Link>
                        <Link href={`/finished-products/history/${item.product._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Details
                        </Link>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {finishedGoods.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No finished goods found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}