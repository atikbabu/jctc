import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const printableRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    const res = await fetch('/api/work-orders');
    if (res.status === 403) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setWorkOrders(data.data);
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
    doc.text('Work Orders List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Order #', 'Product', 'Quantity', 'Status', 'Created At'];
    const rows = workOrders.map(order => [
      order.orderNumber,
      order.product?.name || 'N/A',
      order.quantity,
      order.status,
      new Date(order.createdAt).toLocaleDateString(),
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

    doc.save(`work-orders-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Order #', 'Product', 'Quantity', 'Status', 'Created At'];
    const rows = workOrders.map(order => [
      `"${order.orderNumber}"`,
      `"${order.product?.name || 'N/A'}"`,
      `"${order.quantity}"`,
      `"${order.status}"`,
      `"${new Date(order.createdAt).toLocaleDateString()}"`,
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
      link.setAttribute("download", "work-orders.csv");
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
        <h1 className="text-2xl font-semibold">Work Orders</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                  <Link href={`/work-orders/${order._id}`}>{order.orderNumber}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm no-print">
                  <Link href={`/work-orders/${order._id}`} className="text-blue-600 hover:underline mr-2">Edit</Link>
                </td>
              </tr>
            ))}
            {workOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">No work orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/work-orders/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Work Order
        </Link>
      </div>
    </div>
  );
}