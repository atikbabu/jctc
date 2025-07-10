// /components/Topbar.js
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useContext } from 'react';
import { UserCog, LogOut } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { AppContext } from '@/context/AppContext';

export default function Topbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { appSettings } = useContext(AppContext);

  return (
    <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center">
        {appSettings.displayType === 'logo' && appSettings.logoUrl ? (
          <img src={appSettings.logoUrl} alt={appSettings.softwareTitle} className="h-8 mr-4" />
        ) : (
          <span className="text-xl font-semibold text-gray-800 mr-4">{appSettings.softwareTitle}</span>
        )}
        <Breadcrumbs />
      </div>
      {session?.user && (
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-sm focus:outline-none text-gray-600 hover:text-gray-900"
            >
              <UserCog className="w-5 h-5" />
              <span className="font-medium">{session.user.name}</span>
              <span className="text-gray-500">({session.user.role})</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  User Profile
                </Link>
                <Link href="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Change Password
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 focus:outline-none"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
