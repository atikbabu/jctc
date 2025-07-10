import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Home, ShoppingCart, Users, Package, Wrench, UserCog, DollarSign } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';

export default function Sidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { appSettings } = useContext(AppContext);

  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full p-4 space-y-4 overflow-y-auto">
      <div className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
        {appSettings.displayType === 'logo' && appSettings.logoUrl ? (
          <img src={appSettings.logoUrl} alt={appSettings.softwareTitle} className="h-10 w-auto" />
        ) : (
          appSettings.softwareTitle
        )}
      </div>

      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded border-b border-gray-800">
          <Home className="w-4 h-4" /> Dashboard
        </Link>

        {(role === 'admin' || role === 'cashier') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('sales')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <ShoppingCart className="w-4 h-4" /> Sales ▾
            </button>
            {openSection === 'sales' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/sales" className="block px-2 py-1 hover:bg-gray-700 rounded">POS</Link>
                <Link href="/sales/list" className="block px-2 py-1 hover:bg-gray-700 rounded">Sales List</Link>
                <Link href="/sales/return" className="block px-2 py-1 hover:bg-gray-700 rounded">Sales Return</Link>
                <Link href="/return-logs" className="block px-2 py-1 hover:bg-gray-700 rounded">Return Log</Link>
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'production_operator') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('garmentProduction')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <Wrench className="w-4 h-4" /> Production ▾
            </button>
            {openSection === 'garmentProduction' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/processing-products" className="block px-2 py-1 hover:bg-gray-700 rounded">Processing Products</Link>
                <Link href="/processing-products/add" className="block px-2 py-1 hover:bg-gray-700 rounded">Add Processing Product</Link>
                <Link href="/finished-products" className="block px-2 py-1 hover:bg-gray-700 rounded">Finished Products</Link>
                <Link href="/finished-products/add" className="block px-2 py-1 hover:bg-gray-700 rounded">Add Finished Product</Link>
                {role === 'admin' && (
                  <>
                    <Link href="/production/categories" className="block px-2 py-1 hover:bg-gray-700 rounded">Categories</Link>
                    <Link href="/production/subcategories" className="block px-2 py-1 hover:bg-gray-700 rounded">SubCategories</Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'material_operator' || role === 'production_operator') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('materials')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <Package className="w-4 h-4" /> Inventory ▾
            </button>
            {openSection === 'materials' && (
              <div className="ml-6 space-y-1 mt-1">
                {(role === 'admin' || role === 'material_operator') && (
                  <>
                    <Link href="/materials" className="block px-2 py-1 hover:bg-gray-700 rounded">Material List</Link>
                    <Link href="/materials/add" className="block px-2 py-1 hover:bg-gray-700 rounded">Add Material</Link>
                  </>
                )}
                <Link href="/finished-goods" className="block px-2 py-1 hover:bg-gray-700 rounded">Finished Goods</Link>
                <Link href="/finished-goods/add" className="block px-2 py-1 hover:bg-gray-700 rounded">Add Finished Good</Link>
                {(role === 'admin' || role === 'material_operator') && (
                  <Link href="/inventory/reorder-materials" className="block px-2 py-1 hover:bg-gray-700 rounded">Reorder Materials</Link>
                )}
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'material_operator') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('purchases')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <ShoppingCart className="w-4 h-4" /> Purchases ▾
            </button>
            {openSection === 'purchases' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/purchases/vendors" className="block px-2 py-1 hover:bg-gray-700 rounded">Vendors</Link>
                <Link href="/purchases/orders" className="block px-2 py-1 hover:bg-gray-700 rounded">Purchase Orders</Link>
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'cashier') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('finance')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <DollarSign className="w-4 h-4" /> Finance ▾
            </button>
            {openSection === 'finance' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/expenses" className="block px-2 py-1 hover:bg-gray-700 rounded">Expenses</Link>
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'cashier') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('customers')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <Users className="w-4 h-4" /> Customers ▾
            </button>
            {openSection === 'customers' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/customers" className="block px-2 py-1 hover:bg-gray-700 rounded">Customer List</Link>
                <Link href="/customers/add" className="block px-2 py-1 hover:bg-gray-700 rounded">Add Customer</Link>
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'hrm_manager') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('hrm')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <Users className="w-4 h-4" /> Human Resources ▾
            </button>
            {openSection === 'hrm' && (
              <div className="ml-6 space-y-1 mt-1">
                <Link href="/employees" className="block px-2 py-1 hover:bg-gray-700 rounded">Employee List</Link>
                <Link href="/hrm/salary-structures" className="block px-2 py-1 hover:bg-gray-700 rounded">Salary Structures</Link>
                <Link href="/hrm/daily-attendance" className="block px-2 py-1 hover:bg-gray-700 rounded">Daily Attendance</Link>
                <Link href="/hrm/skill-bonus-report" className="block px-2 py-1 hover:bg-gray-700 rounded">Skill Bonus Report</Link>
                <Link href="/hrm/salary-report" className="block px-2 py-1 hover:bg-gray-700 rounded">Salary Report</Link>
              </div>
            )}
          </div>
        )}

        {(role === 'admin' || role === 'cashier' || role === 'material_operator' || role === 'production_operator' || role === 'hrm_manager') && (
          <div className="border-b border-gray-800 pb-1">
            <button
              onClick={() => toggleSection('reports')}
              className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
            >
              <Home className="w-4 h-4" /> Reports ▾
            </button>
            {openSection === 'reports' && (
              <div className="ml-6 space-y-1 mt-1">
                {(role === 'admin' || role === 'cashier') && (
                  <>
                    <Link href="/reports/expenses" className="block px-2 py-1 hover:bg-gray-700 rounded">Expense Report</Link>
                    <Link href="/reports/expense-vs-sell" className="block px-2 py-1 hover:bg-gray-700 rounded">Expense vs. Sell Report</Link>
                    <Link href="/reports/annual-turnover" className="block px-2 py-1 hover:bg-gray-700 rounded">Annual Turnover Report</Link>
                  </>
                )}
                {(role === 'admin' || role === 'material_operator') && (
                  <Link href="/reports/material-cost" className="block px-2 py-1 hover:bg-gray-700 rounded">Material Cost Report</Link>
                )}
                {(role === 'admin' || role === 'production_operator') && (
                  <Link href="/reports/production-summary" className="block px-2 py-1 hover:bg-gray-700 rounded">Production Summary</Link>
                )}
                {(role === 'admin' || role === 'hrm_manager') && (
                  <>
                    <Link href="/hrm/skill-bonus-report" className="block px-2 py-1 hover:bg-gray-700 rounded">Skill Bonus Report</Link>
                    <Link href="/hrm/salary-report" className="block px-2 py-1 hover:bg-gray-700 rounded">Salary Report</Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <div className="border-b border-gray-800 pb-1">
          <button
            onClick={() => toggleSection('settings')}
            className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded"
          >
            <UserCog className="w-4 h-4" /> Settings ▾
          </button>
          {openSection === 'settings' && (
            <div className="ml-6 space-y-1 mt-1">
              <Link href="/profile" className="block px-2 py-1 hover:bg-gray-700 rounded">User Profile</Link>
              <Link href="/change-password" className="block px-2 py-1 hover:bg-gray-700 rounded">Change Password</Link>
              {(role === 'admin' || role === 'hrm_manager') && (
                <Link href="/settings/users" className="block px-2 py-1 hover:bg-gray-700 rounded">User Management</Link>
              )}
              {role === 'admin' && (
                <Link href="/settings/general" className="block px-2 py-1 hover:bg-gray-700 rounded">General Settings</Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
