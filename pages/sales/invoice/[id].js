// /pages/sales/invoice/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    const res = await fetch(`/api/sales/${id}`);
    const data = await res.json();
    setInvoice(data);
  };

  if (!invoice) return <div className="p-4">Loading...</div>;

  const vatRate = 0.05; // 5% VAT
  const discount = invoice.discount || 0;
  const vatAmount = invoice.total * vatRate;
  const grandTotal = invoice.total + vatAmount - discount;

  return (
    <div className="p-6 bg-white max-w-3xl mx-auto shadow print:shadow-none print:bg-white">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="JC&TC Logo" className="mx-auto h-16 print:hidden" />
        <h1 className="text-2xl font-bold mt-2">JC & TC Garments</h1>
        <p className="text-sm">123 Market Road, Dhaka | +880123456789 | info@jctc.com</p>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <div>
          <p><strong>Invoice ID:</strong> {invoice._id}</p>
          <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p><strong>Customer:</strong> {invoice.customerName || 'Walk-in'}</p>
          <p><strong>Payment:</strong> {invoice.paymentMethod}</p>
        </div>
      </div>

      <table className="w-full border-collapse mt-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Product</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">{item.finishedGood.finishedCode} ({item.size})</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-right">৳ {item.price}</td>
              <td className="border p-2 text-right">৳ {item.quantity * item.price}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="border p-2 text-right font-semibold">Subtotal</td>
            <td className="border p-2 text-right">৳ {invoice.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3" className="border p-2 text-right font-semibold">VAT (5%)</td>
            <td className="border p-2 text-right">৳ {vatAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3" className="border p-2 text-right font-semibold">Discount</td>
            <td className="border p-2 text-right">৳ {discount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3" className="border p-2 text-right font-bold">Grand Total</td>
            <td className="border p-2 text-right font-bold">৳ {grandTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="text-center mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
}
