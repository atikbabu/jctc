import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        try {
          const res = await fetch(`/api/employees/${id}`, { credentials: 'include' });
          if (res.status === 403) {
            router.push('/login');
            return;
          }
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch employee details');
          }
          const data = await res.json();
          setEmployee(data);
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

  if (!employee) {
    return <div className="p-6">Employee not found.</div>;
  }

  return (
    <div className="space-y-6 p-6 print:p-0 print:m-0 print:w-full print:h-full">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Employee Details: {employee.name}</h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
        >
          Print Profile
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg print:shadow-none print:rounded-none">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 print:bg-white print:border-b print:border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Employee Information</h3>
        </div>
        <div className="border-t border-gray-200 print:border-none">
          <dl className="divide-y divide-gray-200 print:divide-none">
            {employee.imageUrl && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 print:grid-cols-1 print:text-center">
                <dt className="text-sm font-medium text-gray-500 print:hidden">Image</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 print:mt-0">
                  <img src={employee.imageUrl} alt="Employee" className="max-w-xs h-auto rounded-md mx-auto print:max-w-[150px] print:rounded-full print:border-2 print:border-gray-300" />
                </dd>
              </div>
            )}
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.employeeId}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.name}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.role}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rank</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.rank || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.contactNumber || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.address || 'N/A'}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date of Joining</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(employee.dateOfJoining).toLocaleDateString()}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Active</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.isActive ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Link href="/employees" className="text-blue-600 hover:underline mt-4 inline-block print:hidden">
        ← Back to Employee List
      </Link>
    </div>
  );
}
