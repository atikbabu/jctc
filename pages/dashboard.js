import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DollarSign, Package, Users, ShoppingCart, Factory } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchDashboardData = async () => {
        try {
          const res = await fetch('/api/dashboard-data', { credentials: 'include' });
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          if (!res.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await res.json();
          setDashboardData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="p-6 text-center">No dashboard data available.</div>;
  }

  const Card = ({ title, value, icon, link }) => (
    <Link href={link || '#'} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </Link>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">ERP Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total Sales"
          value={`৳ ${dashboardData.totalSales.toFixed(2)}`}
          icon={<DollarSign className="text-green-500" size={28} />}
          link="/sales/list"
        />
        <Card
          title="Finished Products"
          value={dashboardData.finishedProductsCount}
          icon={<Package className="text-blue-500" size={28} />}
          link="/finished-products"
        />
        <Card
          title="Total Employees"
          value={dashboardData.totalEmployees}
          icon={<Users className="text-purple-500" size={28} />}
          link="/employees"
        />
        <Card
          title="Low Stock Materials"
          value={dashboardData.lowStockMaterials}
          icon={<Package className="text-red-500" size={28} />}
          link="/materials"
        />
        <Card
          title="Pending Purchase Orders"
          value={dashboardData.pendingPurchaseOrders}
          icon={<ShoppingCart className="text-yellow-500" size={28} />}
          link="/purchases/orders"
        />
        <Card
          title="Total Purchases"
          value={`৳ ${dashboardData.totalPurchaseAmount.toFixed(2)}`}
          icon={<DollarSign className="text-orange-500" size={28} />}
          link="/purchases/orders"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions & Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/sales" className="bg-blue-100 text-blue-800 p-4 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-2">
            <ShoppingCart size={20} />
            <span>Go to POS</span>
          </Link>
          <Link href="/production/categories" className="bg-green-100 text-green-800 p-4 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center space-x-2">
            <Factory size={20} />
            <span>Manage Production Categories</span>
          </Link>
          <Link href="/reports" className="bg-purple-100 text-purple-800 p-4 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center space-x-2">
            <Users size={20} />
            <span>View All Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}