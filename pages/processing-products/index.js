import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { jsPDF } from 'jspdf';
import { MoreVertical } from 'lucide-react';

export default function ProcessingProductListPage() {
  const [processingProducts, setProcessingProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState('');

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMarkAsCompleted = async (id) => {
    try {
      const res = await fetch(`/api/processing-products/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to mark as completed');
      }

      setMessage('✅ Processing product marked as completed successfully!');
      fetchProcessingProducts(); // Re-fetch data to update the list
    } catch (error) {
      setMessage(`❌ Error marking as completed: ${error.message}`);
      console.error('Error marking processing product as completed:', error);
    }
  };

  useEffect(() => {
    fetchProcessingProducts();
  }, []);

  const fetchProcessingProducts = async () => {
    try {
      const res = await fetch('/api/processing-products');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        console.error('API response not OK:', res.status, res.statusText);
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch processing products');
      }
      const data = await res.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setProcessingProducts(data);
      } else {
        console.error('API returned non-array data:', data);
        setProcessingProducts([]); // Fallback to empty array
      }
    } catch (error) {
      console.error('Error fetching processing products:', error);
      // Optionally set an error message in state to display to the user
      setMessage(`❌ Error fetching processing products: ${error.message}`);
      setProcessingProducts([]); // Ensure it's an array even on error
    }
  };

  const filteredProducts = processingProducts.filter(product =>
    product.processingCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePdf = async () => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.text("Processing Products Report", 14, 16);

    const tableColumn = ["Purchased Code", "Processing Code", "Cutting Staff", "Embroidery Staff", "Packaging Staff", "Start Date", "End Date", "Status", "Category", "Sub Category"];
    const tableRows = [];

    filteredProducts.forEach(product => {
      const productData = [
        product.purchasedProduct?.name || 'N/A',
        product.processingCode,
        product.cuttingStaff || 'N/A',
        product.embroideryStaff || 'N/A',
        product.packagingStaff || 'N/A',
        new Date(product.startDate).toLocaleDateString(),
        product.endDate ? new Date(product.endDate).toLocaleDateString() : 'N/A',
        product.status,
        product.category || 'N/A',
        product.subCategory || 'N/A',
      ];
      tableRows.push(productData);
    });

    autoTable(doc, { head: tableColumn, body: tableRows, startY: 20 });
    doc.save('processing-products-report.pdf');
  };

  const printTable = () => {
    const printContent = document.querySelector('#processing-products-table').outerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore original page content and functionality
  };

  const exportToExcel = () => {
    const headers = ["Purchased Code", "Processing Code", "Cutting Staff", "Embroidery Staff", "Packaging Staff", "Start Date", "End Date", "Status", "Category", "Sub Category"];
    const rows = filteredProducts.map(product => [
      `"${product.purchasedProduct?.name || 'N/A'}"`,
      `"${product.processingCode}"`,
      `"${product.cuttingStaff || 'N/A'}"`,
      `"${product.embroideryStaff || 'N/A'}"`,
      `"${product.packagingStaff || 'N/A'}"`,
      `"${new Date(product.startDate).toLocaleDateString()}"`,
      `"${product.endDate ? new Date(product.endDate).toLocaleDateString() : 'N/A'}"`,
      `"${product.status}"`,
      `"${product.category || 'N/A'}"`,
      `"${product.subCategory || 'N/A'}"`,
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
      link.setAttribute("download", "processing-products.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Processing Products</h1>
        <div className="flex space-x-2">
          <button onClick={generatePdf} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Export PDF</button>
          <button onClick={printTable} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Print</button>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export Excel</button>
          <Link href="/processing-products/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Processing Product
          </Link>
        </div>
      </div>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      <input
        type="text"
        placeholder="Search by Processing Code..."
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table id="processing-products-table" className="min-w-full border border-gray-300 border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Purchased Code</th>
              <th className="border border-gray-300 p-2 text-left">Processing Code</th>
              <th className="border border-gray-300 p-2 text-left">Cutting Staff</th>
              <th className="border border-gray-300 p-2 text-left">Embroidery Staff</th>
              <th className="border border-gray-300 p-2 text-left">Packaging Staff</th>
              <th className="border border-gray-300 p-2 text-left">Start Date</th>
              <th className="border border-gray-300 p-2 text-left">End Date</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Sub Category</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="border p-2">{product.purchasedProduct?.name || 'N/A'}</td>
                <td className="border p-2">{product.processingCode}</td>
                <td className="border p-2">{product.cuttingStaff?.name || 'N/A'}</td>
                <td className="border p-2">{product.embroideryStaff?.name || 'N/A'}</td>
                <td className="border p-2">{product.packagingStaff?.name || 'N/A'}</td>
                <td className="border p-2">{new Date(product.startDate).toLocaleDateString()}</td>
                <td className="border p-2">{product.endDate ? new Date(product.endDate).toLocaleDateString() : 'N/A'}</td>
                <td className="border p-2">{product.status}</td>
                <td className="border p-2">{product.category?.name || 'N/A'}</td>
                <td className="border p-2">{product.subCategory?.name || 'N/A'}</td>
                <td className="border border-gray-300 p-2 relative">
                  <button
                    onClick={() => toggleMenu(product._id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === product._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <Link href={`/processing-products/${product._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </Link>
                      <Link href={`/processing-products/details/${product._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Details
                      </Link>
                      {product.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkAsCompleted(product._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center text-gray-500 p-4">No processing products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}