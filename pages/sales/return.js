import { useEffect, useState } from 'react';

export default function SalesReturnPage() {
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState('');
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const res = await fetch('/api/sales');
    const data = await res.json();
    setSales(data);
  };

  const handleReasonChange = (saleId, productName, value) => {
    setReasons(prev => ({
      ...prev,
      [`${saleId}_${productName}`]: value
    }));
  };

  const handleReturn = async (item, saleId) => {
    const reason = reasons[`${saleId}_${item.productName}`] || '';
    const res = await fetch('/api/sales/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saleId, item, reason }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage('✅ Item returned successfully.');
      fetchSales();
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales Return</h1>

      {message && <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">{message}</div>}

      {sales.map((sale) => (
        <div key={sale._id} className="bg-white rounded shadow p-4">
          <h2 className="font-semibold">{new Date(sale.createdAt).toLocaleString()}</h2>
          <p className="text-sm text-gray-600 mb-2">Payment: {sale.paymentMethod}</p>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => {
                const returned = sale.returnedItems?.some(r => r.productName === item.productName);
                return (
                  <tr key={idx} className={returned ? 'opacity-50' : ''}>
                    <td className="border p-2">{item.productName}</td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Reason for return"
                        className="border p-1 rounded w-full"
                        disabled={returned}
                        value={reasons[`${sale._id}_${item.productName}`] || ''}
                        onChange={(e) => handleReasonChange(sale._id, item.productName, e.target.value)}
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleReturn(item, sale._id)}
                        className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600"
                        disabled={returned}
                      >
                        {returned ? 'Returned' : 'Return'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
