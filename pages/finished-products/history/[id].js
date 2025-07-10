import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function FinishedProductHistoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [finishedProduct, setFinishedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`/api/finished-products/history/${id}`, { credentials: 'include' });
          if (res.status === 403) {
            router.push('/login');
            return;
          }
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch finished product history');
          }
          const data = await res.json();
          setFinishedProduct(data);
        } catch (error) {
          setMessage(`❌ Error fetching history: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [id, router]);

  if (loading) {
    return <div className="p-6">Loading history...</div>;
  }

  if (message) {
    return <div className="p-6 text-red-500">{message}</div>;
  }

  if (!finishedProduct) {
    return <div className="p-6">Finished Product history not found.</div>;
  }

  const pp = finishedProduct.processingProduct;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Finished Product History: {finishedProduct.finishedCode}</h1>

      {/* Finished Product Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Finished Product Details</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Finished Code</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{finishedProduct.finishedCode}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Finished Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(finishedProduct.finishedDate).toLocaleDateString()}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Product Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{finishedProduct.productType}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">৳ {finishedProduct.price.toFixed(2)}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{finishedProduct.category?.name || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sub Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{finishedProduct.subCategory?.name || 'N/A'}</dd>
            </div>
            {finishedProduct.imageUrl && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Image</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <img src={finishedProduct.imageUrl} alt="Finished Product" className="max-w-xs h-auto rounded-md" />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {pp && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Processing Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Processing Code</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.processingCode}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Purchased Product</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.purchasedProduct?.name || 'N/A'}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(pp.startDate).toLocaleDateString()}</dd>
              </div>
              {pp.endDate && (
                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(pp.endDate).toLocaleDateString()}</dd>
                </div>
              )}
              <div className="px-4 py-3 sm:sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Cutting Staff</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.cuttingStaff?.name || 'N/A'}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Embroidery Staff</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.embroideryStaff?.name || 'N/A'}</dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Packaging Staff</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.packagingStaff?.name || 'N/A'}</dd>
              </div>
              {pp.notes && (
                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pp.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {pp && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Processing Costs</h3>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cutting Cost</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{pp.cuttingCost?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Embroidery Cost</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{pp.embroideryCost?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Packaging Cost</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{pp.packagingCost?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Other Processing Costs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{pp.otherProcessingCosts?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total Processing Cost</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    ৳ {(pp.cuttingCost + pp.embroideryCost + pp.packagingCost + pp.otherProcessingCosts)?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link href="/finished-products" className="text-blue-600 hover:underline mt-4 inline-block">
        ← Back to Finished Products List
      </Link>
    </div>
  );
}
