import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function SalaryStructureListPage() {
  const [structures, setStructures] = useState([]);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const printableRef = useRef();

  useEffect(() => {
    fetchSalaryStructures();
  }, []);

  const fetchSalaryStructures = async () => {
    try {
      const res = await fetch('/api/salary-structures');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setStructures(data);
    } catch (error) {
      setMessage(`❌ Error fetching salary structures: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this salary structure?')) {
      try {
        const res = await fetch(`/api/salary-structures/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('✅ Salary structure deleted successfully');
          fetchSalaryStructures(); // Refresh the list
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting salary structure: ${err.error || 'Something went wrong'}`);
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
    doc.text('Salary Structures List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Rank', 'Basic Pay', 'House Rent', 'Medical', 'Conveyance', 'OT/Hour', 'Max Skills Bonus'];
    const rows = structures.map(structure => [
      structure.rank,
      structure.basicPay.toFixed(2),
      structure.houseRentAllowance.toFixed(2),
      structure.medicalAllowance.toFixed(2),
      structure.conveyanceAllowance.toFixed(2),
      structure.overtimeAllowancePerHour.toFixed(2),
      structure.maxSkillsBonus.toFixed(2),
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

    doc.save(`salary-structures-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Rank', 'Basic Pay', 'House Rent', 'Medical', 'Conveyance', 'OT/Hour', 'Max Skills Bonus'];
    const rows = structures.map(structure => [
      `"${structure.rank}"`,
      `"${structure.basicPay.toFixed(2)}"`,
      `"${structure.houseRentAllowance.toFixed(2)}"`,
      `"${structure.medicalAllowance.toFixed(2)}"`,
      `"${structure.conveyanceAllowance.toFixed(2)}"`,
      `"${structure.overtimeAllowancePerHour.toFixed(2)}"`,
      `"${structure.maxSkillsBonus.toFixed(2)}"`,
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
      link.setAttribute("download", "salary-structures.csv");
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
        <h1 className="text-2xl font-semibold">Salary Structures</h1>
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
              <th className="border p-2 text-left">Rank</th>
              <th className="border p-2 text-right">Basic Pay</th>
              <th className="border p-2 text-right">House Rent</th>
              <th className="border p-2 text-right">Medical</th>
              <th className="border p-2 text-right">Conveyance</th>
              <th className="border p-2 text-right">OT/Hour</th>
              <th className="border p-2 text-right">Max Skills Bonus</th>
              <th className="border p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {structures.map((structure) => (
              <tr key={structure._id}>
                <td className="border p-2">{structure.rank}</td>
                <td className="border p-2 text-right">{structure.basicPay.toFixed(2)}</td>
                <td className="border p-2 text-right">{structure.houseRentAllowance.toFixed(2)}</td>
                <td className="border p-2 text-right">{structure.medicalAllowance.toFixed(2)}</td>
                <td className="border p-2 text-right">{structure.conveyanceAllowance.toFixed(2)}</td>
                <td className="border p-2 text-right">{structure.overtimeAllowancePerHour.toFixed(2)}</td>
                <td className="border p-2 text-right">{structure.maxSkillsBonus.toFixed(2)}</td>
                <td className="border p-2 text-center no-print">
                  <Link href={`/hrm/salary-structures/${structure._id}`} className="text-blue-600 hover:underline mr-2">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(structure._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {structures.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 p-4">No salary structures found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/hrm/salary-structures/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Salary Structure
        </Link>
      </div>
    </div>
  );
}