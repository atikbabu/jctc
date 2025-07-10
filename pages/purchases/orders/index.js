import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';


export default function PurchaseOrderListPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState(null);
  const printableRef = useRef();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const res = await fetch('/api/purchase-orders', { credentials: 'include' });
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch purchase orders');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPurchaseOrders(data);
      } else {
        console.error('API returned non-array data:', data);
        setPurchaseOrders([]);
      }
    } catch (error) {
      setMessage(`❌ Error fetching purchase orders: ${error.message}`);
      setPurchaseOrders([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        const res = await fetch(`/api/purchase-orders/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          setMessage('✅ Purchase order deleted successfully');
          fetchPurchaseOrders();
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting purchase order: ${err.error || 'Something went wrong'}`);
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
    doc.text('Purchase Order List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['PO Number', 'Vendor', 'Order Date', 'Expected Delivery', 'Status', 'Total Amount'];
    const rows = purchaseOrders.map(po => [
      po.poNumber,
      po.vendor?.name || 'N/A',
      new Date(po.orderDate).toLocaleDateString(),
      po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A',
      po.status,
      po.totalAmount.toFixed(2),
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

    doc.save(`purchase-order-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['PO Number', 'Vendor', 'Order Date', 'Expected Delivery', 'Status', 'Total Amount'];
    const rows = purchaseOrders.map(po => [
      `"${po.poNumber}"`,
      `"${po.vendor?.name || 'N/A'}"`,
      `"${new Date(po.orderDate).toLocaleDateString()}"`,
      `"${po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}"`,
      `"${po.status}"`,
      `"${po.totalAmount.toFixed(2)}"`,
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
      link.setAttribute("download", "purchase-orders.csv");
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
        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
          <Link href="/purchases/orders/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Create Purchase Order
          </Link>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">PO Number</th>
              <th className="border border-gray-300 p-2 text-left">Vendor</th>
              <th className="border border-gray-300 p-2 text-left">Order Date</th>
              <th className="border border-gray-300 p-2 text-left">Expected Delivery</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-right">Total Amount</th>
              <th className="border border-gray-300 p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po._id}>
                <td className="border border-gray-300 p-2">{po.poNumber}</td>
                <td className="border border-gray-300 p-2">{po.vendor?.name || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{new Date(po.orderDate).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                <td className="border border-gray-300 p-2">{po.status}</td>
                <td className="border border-gray-300 p-2 text-right">{po.totalAmount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 relative text-center no-print">
                  <button
                    onClick={() => toggleMenu(po._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === po._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/purchases/orders/${po._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        View/Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(po._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-4">No purchase orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}