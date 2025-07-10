import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/settings/users" className="block p-4 border border-gray-200 rounded-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-gray-600">Manage user accounts and roles.</p>
        </Link>
        <Link href="/hrm/salary-structures" className="block p-4 border border-gray-200 rounded-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Salary Structures</h2>
          <p className="text-gray-600">Define and manage employee salary components.</p>
        </Link>
        <Link href="/hrm/daily-attendance" className="block p-4 border border-gray-200 rounded-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Daily Attendance</h2>
          <p className="text-gray-600">Log and review daily employee attendance.</p>
        </Link>
        {/* Add more settings options here */}
      </div>
    </div>
  );
}
