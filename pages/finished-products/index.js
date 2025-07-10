import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical } from 'lucide-react';
import jsPDF from 'jspdf';


export default function FinishedProductListPage() {
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const printableRef = useRef();

  // Define filteredProducts here to ensure it's always in scope
  const filteredProducts = finishedProducts.filter(product =>
    product.finishedCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const router = useRouter();

  useEffect(() => {
    fetchFinishedProducts();
  }, []);

  const fetchFinishedProducts = async () => {
    try {
      const res = await fetch('/api/finished-products');
      if (res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        console.error('API response not OK:', res.status, res.statusText);
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch finished products');
      }
      const data = await res.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setFinishedProducts(data);
      } else {
        console.error('API returned non-array data:', data);
        setFinishedProducts([]); // Fallback to empty array
      }
    }
    catch (error) {
      console.error('Error fetching finished products:', error);
      // Optionally set an error message in state to display to the user
      // setMessage(`❌ Error fetching finished products: ${error.message}`);
      setFinishedProducts([]); // Ensure it's an array even on error
    }
  };

  const generatePdf = async () => {
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Jhinuk Crafting & Training Center (JC & TC)', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Finished Products Report', pageWidth / 2, 60, { align: 'center' });

    // Timestamp
    const date = new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated On: ${date}`, 40, 80);

    const tableColumn = ["Finished Code", "Processing Code", "Product Type", "Sizes & Quantities", "Finished Date", "Category", "Sub Category"];
    const tableRows = [];

    filteredProducts.forEach(product => {
      const sizesAndQuantities = product.sizes.map(s => `${s.size}: ${s.quantity}`).join(', ');
      const productData = [
        product.finishedCode,
        product.processingProduct?.processingCode || 'N/A',
        product.productType,
        sizesAndQuantities,
        new Date(product.finishedDate).toLocaleDateString(),
        product.category?.name || 'N/A',
        product.subCategory?.name || 'N/A',
      ];
      tableRows.push(productData);
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

    doc.save(`finished-products-report-${Date.now()}.pdf`);
  };

  const printTable = () => {
    const original = document.body.innerHTML;
    document.body.innerHTML = printableRef.current.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload(); // Reload to restore original page content and functionality
  };

  const exportToExcel = () => {
    const headers = ["Finished Code", "Processing Code", "Product Type", "Sizes & Quantities", "Finished Date", "Category", "Sub Category"];
    const rows = filteredProducts.map(product => {
      const sizesAndQuantities = product.sizes.map(s => `${s.size}: ${s.quantity}`).join('; '); // Use semicolon for CSV to avoid issues with comma in size string
      return [
        `"${product.finishedCode}"`,
        `"${product.processingProduct?.processingCode || 'N/A'}"`,
        `"${product.productType}"`,
        `"${sizesAndQuantities}"`,
        `"${new Date(product.finishedDate).toLocaleDateString()}"`,
        `"${product.category?.name || 'N/A'}"`,
        `"${product.subCategory?.name || 'N/A'}"`,
      ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "finished-products.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-semibold">Finished Products</h1>
        <div className="flex space-x-2">
          <button onClick={generatePdf} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={exportToExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
          <button onClick={printTable} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
          <Link href="/finished-products/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Finished Product
          </Link>
        </div>
      </div>

      {/* {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>} */}

      <input
        type="text"
        placeholder="Search by Finished Code..."
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div ref={printableRef} className="overflow-x-auto bg-white p-4 rounded shadow printable-content">
        <table id="finished-products-table" className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Finished Code</th>
              <th className="border p-2 text-left">Processing Code</th>
              <th className="border p-2 text-left">Product Type</th>
              <th className="border p-2 text-left">Sizes & Quantities</th>
              <th className="border p-2 text-left">Finished Date</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Sub Category</th>
              <th className="border p-2 text-left no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="border p-2">{product.finishedCode}</td>
                <td className="border p-2">{product.processingProduct?.processingCode || 'N/A'}</td>
                <td className="border p-2">{product.productType}</td>
                <td className="border p-2">
                  {product.sizes.map((s, index) => (
                    <div key={index}>{s.size}: {s.quantity}</div>
                  ))}
                </td>
                <td className="border p-2">{new Date(product.finishedDate).toLocaleDateString()}</td>
                <td className="border p-2">{product.category?.name || 'N/A'}</td>
                <td className="border p-2">{product.subCategory?.name || 'N/A'}</td>
                <td className="border p-2 no-print">
                  <Link href={`/finished-products/${product._id}`} className="text-blue-600 hover:underline mr-2">Edit</Link>
                  {/* Add Delete functionality later if needed */}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 p-4">No finished products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}