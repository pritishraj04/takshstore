"use client";

import { Menu, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('admin_session');
    router.push('/admin/login');
  };

  return (
    <header className="h-[68px] flex shrink-0 items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm z-20">
      {/* Mobile Menu Icon Placeholder */}
      <div className="flex md:hidden">
        <button className="text-gray-500 hover:text-black transition-colors rounded-lg p-2 bg-gray-50 border border-gray-200">
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Spacer for Desktop (Since Sidebar is on the left, we can just push items to the right) */}
      <div className="hidden md:block flex-1"></div>

      {/* Right Side Controls */}
      <div className="flex items-center justify-end flex-1 md:flex-none gap-3 md:gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <User className="w-4 h-4 text-gray-400" />
            <span className="hidden sm:inline tracking-tight">System Admin</span>
        </div>
        
        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
