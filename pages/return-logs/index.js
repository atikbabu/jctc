import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function ReturnLogListPage() {
  const [returnLogs, setReturnLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const printableRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetchReturnLogs();
  }, []);

  const fetchReturnLogs = async () => {
    const res = await fetch('/api/return-logs');
    const data = await res.json();
    setReturnLogs(data);
  };

  const filteredLogs = returnLogs.filter(log =>
    log.finishedProduct?.finishedCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePdf = async () => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Jhinuk Crafting & Training Center (JC & TC)', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Return Log Report', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    const tableColumn = ["Finished Product Code", "Quantity", "Reason", "Return Date"];
    const tableRows = [];

    filteredLogs.forEach(log => {
      const logData = [
        log.finishedProduct?.finishedCode || 'N/A',
        log.quantity,
        log.reason,
        new Date(log.returnDate).toLocaleDateString(),
      ];
      tableRows.push(logData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [30, 144, 255] },
      margin: { left: 40, right: 40 }
    });

    doc.save(`return-log-report-${Date.now()}.pdf`);
  };

  const printTable = () => {
    const original = document.body.innerHTML;
    document.body.innerHTML = printableRef.current.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  const exportToExcel = () => {
    const headers = ["Finished Product Code", "Quantity", "Reason", "Return Date"];
    const rows = filteredLogs.map(log => [
      `"${log.finishedProduct?.finishedCode || 'N/A'}"`,
      `"${log.quantity}"`,
      `"${log.reason}"`,
      `"${new Date(log.returnDate).toLocaleDateString()}"`,
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "return-log.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-semibold">Return Log</h1>
        <div className="flex space-x-2">
          <button onClick={generatePdf} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={exportToExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={printTable} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Finished Product Code or Reason..."
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div ref={printableRef} className="overflow-x-auto bg-white p-4 rounded shadow printable-content">
        <table id="return-log-table" className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Finished Product Code</th>
              <th className="border p-2 text-left">Quantity</th>
              <th className="border p-2 text-left">Reason</th>
              <th className="border p-2 text-left">Return Date</th>
              <th className="border p-2 text-left no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td className="border p-2">{log.finishedProduct?.finishedCode || 'N/A'}</td>
                <td className="border p-2">{log.quantity}</td>
                <td className="border p-2">{log.reason}</td>
                <td className="border p-2">{new Date(log.returnDate).toLocaleDateString()}</td>
                <td className="border p-2 no-print">
                  <Link href={`/return-logs/${log._id}`} className="text-blue-600 hover:underline mr-2">Edit</Link>
                  {/* Add Delete functionality later if needed */}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">No return logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/return-logs/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Return Log
        </Link>
      </div>
    </div>
  );
}