import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';



export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const printableRef = useRef();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      setMessage(`❌ Error fetching employees: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('✅ Employee deleted successfully');
          fetchEmployees(); // Refresh the list
        } else {
          const err = await res.json();
          setMessage(`❌ Error deleting employee: ${err.error || 'Something went wrong'}`);
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
    doc.text('Employee List', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    // Table data
    const columns = ['Name', 'Employee ID', 'Role', 'Contact', 'Address', 'Joining Date', 'Status'];
    const rows = employees.map(employee => [
      employee.name,
      employee.employeeId,
      employee.role,
      employee.contactNumber || 'N/A',
      employee.address || 'N/A',
      new Date(employee.dateOfJoining).toLocaleDateString(),
      employee.isActive ? 'Active' : 'Inactive',
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

    doc.save(`employee-list-${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const headers = ['Name', 'Employee ID', 'Role', 'Contact', 'Address', 'Joining Date', 'Status'];
    const rows = employees.map(employee => [
      `"${employee.name}"`,
      `"${employee.employeeId}"`,
      `"${employee.role}"`,
      `"${employee.contactNumber}"`,
      `"${employee.address}"`,
      `"${new Date(employee.dateOfJoining).toLocaleDateString()}"`,
      `"${employee.isActive ? 'Active' : 'Inactive'}"`,
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
      link.setAttribute("download", "employees.csv");
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
        <h1 className="text-2xl font-semibold">Employee List</h1>
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
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Employee ID</th>
              <th className="border border-gray-300 p-2 text-left">Role</th>
              <th className="border border-gray-300 p-2 text-left">Contact</th>
              <th className="border border-gray-300 p-2 text-left">Address</th>
              <th className="border border-gray-300 p-2 text-left">Joining Date</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td className="border border-gray-300 p-2">{employee.name}</td>
                <td className="border border-gray-300 p-2">{employee.employeeId}</td>
                <td className="border border-gray-300 p-2">{employee.role}</td>
                <td className="border border-gray-300 p-2">{employee.contactNumber}</td>
                <td className="border border-gray-300 p-2">{employee.address}</td>
                <td className="border border-gray-300 p-2">{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{employee.isActive ? 'Active' : 'Inactive'}</td>
                <td className="border border-gray-300 p-2 relative text-center no-print">
                  <button
                    onClick={() => toggleMenu(employee._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === employee._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/employees/${employee._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </Link>
                      <Link href={`/employees/details/${employee._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Details
                      </Link>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 p-4">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex justify-end mt-4">
        <Link href="/employees/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Employee
        </Link>
      </div>
    </div>
  );
}