import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProcessingProductDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [processingProduct, setProcessingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        try {
          const res = await fetch(`/api/processing-products/${id}`, { credentials: 'include' });
          if (res.status === 403) {
            router.push('/login');
            return;
          }
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch processing product details');
          }
          const data = await res.json();
          setProcessingProduct(data);
        } catch (error) {
          setMessage(`❌ Error fetching details: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [id, router]);

  if (loading) {
    return <div className="p-6">Loading details...</div>;
  }

  if (message) {
    return <div className="p-6 text-red-500">{message}</div>;
  }

  if (!processingProduct) {
    return <div className="p-6">Processing Product not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Processing Product Details: {processingProduct.processingCode}</h1>

      {/* General Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">General Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Processing Code</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.processingCode}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Purchased Product</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.purchasedProduct?.name || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(processingProduct.startDate).toLocaleDateString()}</dd>
            </div>
            {processingProduct.endDate && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(processingProduct.endDate).toLocaleDateString()}</dd>
              </div>
            )}
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.status}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.category?.name || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sub Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.subCategory?.name || 'N/A'}</dd>
            </div>
            {processingProduct.notes && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.notes}</dd>
              </div>
            )}
            {processingProduct.imageUrl && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Image</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <img src={processingProduct.imageUrl} alt="Processing Product" className="max-w-xs h-auto rounded-md" />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Staff Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Staff Details</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cutting Staff</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.cuttingStaff?.name || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Embroidery Staff</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.embroideryStaff?.name || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Packaging Staff</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{processingProduct.packagingStaff?.name || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Cost Breakdown</h3>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{processingProduct.cuttingCost?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Embroidery Cost</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{processingProduct.embroideryCost?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Packaging Cost</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{processingProduct.packagingCost?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Other Processing Costs</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{processingProduct.otherProcessingCosts?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total Processing Cost</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  ৳ {(processingProduct.cuttingCost + processingProduct.embroideryCost + processingProduct.packagingCost + processingProduct.otherProcessingCosts)?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/processing-products" className="text-blue-600 hover:underline mt-4 inline-block">
        ← Back to Processing Products List
      </Link>
    </div>
  );
}
