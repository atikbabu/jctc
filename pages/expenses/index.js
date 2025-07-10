import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';


export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState([]);
  const [message, setMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const router = useRouter();
  const printableRef = useRef();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses', { credentials: 'include' });
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch expenses');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      }
      else {
        console.error('API returned non-array data:', data);
        setExpenses([]);
      }
    }
    catch (error) {
      setMessage(`❌ Error fetching expenses: ${error.message}`);
      setExpenses([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const res = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          setMessage('✅ Expense deleted successfully');
          fetchExpenses();
        }
        else {
          const err = await res.json();
          setMessage(`❌ Error deleting expense: ${err.error || 'Something went wrong'}`);
        }
      }
      catch (error) {
        setMessage(`❌ Network error: ${error.message}`);
      }
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
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
    doc.text('Expense List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Date', 'Amount', 'Category', 'Description', 'Recorded By'];
    const rows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.amount.toFixed(2),
      expense.category,
      expense.description || 'N/A',
      expense.recordedBy?.name || 'N/A',
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

    doc.save(`expense-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Amount', 'Category', 'Description', 'Recorded By'];
    const rows = expenses.map(expense => [
      `"${new Date(expense.date).toLocaleDateString()}"`,
      `"${expense.amount.toFixed(2)}"`,
      `"${expense.category}"`,
      `"${expense.description || 'N/A'}"`,
      `"${expense.recordedBy?.name || 'N/A'}"`,
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
      link.setAttribute("download", "expenses.csv");
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
        <h1 className="text-2xl font-semibold">Expenses</h1>
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
              <th className="border border-gray-300 p-2 text-left">Date</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Recorded By</th>
              <th className="border border-gray-300 p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td className="border border-gray-300 p-2">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{expense.amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{expense.category}</td>
                <td className="border border-gray-300 p-2">{expense.description || 'N/A'}</td>
                <td className="border border-gray-300 p-2">{expense.recordedBy?.name || 'N/A'}</td>
                <td className="border border-gray-300 p-2 relative text-center no-print">
                  <button
                    onClick={() => toggleMenu(expense._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === expense._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/expenses/${expense._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/expenses/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Expense
        </Link>
      </div>
    </div>
  );
}