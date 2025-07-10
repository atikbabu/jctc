import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function DailyAttendanceListPage() {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const printableRef = useRef();

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  const fetchAttendanceLogs = async () => {
    try {
      const res = await fetch('/api/daily-attendance');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setAttendanceLogs(data);
    } catch (error) {
      setMessage(`❌ Error fetching attendance logs: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this attendance log?')) {
      try {
        const res = await fetch(`/api/daily-attendance/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('✅ Attendance log deleted successfully');
          fetchAttendanceLogs(); // Refresh the list
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting attendance log: ${err.error || 'Something went wrong'}`);
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
    doc.text('Daily Attendance Logs', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Employee Name', 'Date', 'Check-in Time', 'Check-out Time', 'Overtime Hours'];
    const rows = attendanceLogs.map(log => [
      log.employee?.name || 'N/A',
      new Date(log.date).toLocaleDateString(),
      log.checkInTime,
      log.checkOutTime,
      log.overtimeHours,
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

    doc.save(`daily-attendance-logs-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Employee Name', 'Date', 'Check-in Time', 'Check-out Time', 'Overtime Hours'];
    const rows = attendanceLogs.map(log => [
      `"${log.employee?.name || 'N/A'}"`,
      `"${new Date(log.date).toLocaleDateString()}"`,
      `"${log.checkInTime}"`,
      `"${log.checkOutTime}"`,
      `"${log.overtimeHours}"`,
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
      link.setAttribute("download", "daily-attendance-logs.csv");
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
        <h1 className="text-2xl font-semibold">Daily Attendance Logs</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <div ref={printableRef} className="bg-white p-4 rounded shadow printable-content">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Employee Name</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Check-in Time</th>
              <th className="border p-2 text-left">Check-out Time</th>
              <th className="border p-2 text-left">Overtime Hours</th>
              <th className="border p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.map((log) => (
              <tr key={log._id}>
                <td className="border p-2">{log.employee?.name || 'N/A'}</td>
                <td className="border p-2">{new Date(log.date).toLocaleDateString()}</td>
                <td className="border p-2">{log.checkInTime}</td>
                <td className="border p-2">{log.checkOutTime}</td>
                <td className="border p-2">{log.overtimeHours}</td>
                <td className="border p-2 text-center no-print">
                  <Link href={`/hrm/daily-attendance/${log._id}`} className="text-blue-600 hover:underline mr-2">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {attendanceLogs.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">No attendance logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/hrm/daily-attendance/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Attendance Log
        </Link>
      </div>
    </div>
  );
}