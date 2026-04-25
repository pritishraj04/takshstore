"use client";

import { Menu, LogOut, User, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { jwtDecode } from 'jwt-decode';

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove('admin_session');
    // Force a hard window location replace to completely clear the Next.js client-side cache
    window.location.replace('/admin/login');
  };

  // Auto-logout on token expiry
  useEffect(() => {
    const token = Cookies.get('admin_session');
    if (token) {
      try {
        const decoded = jwtDecode(token) as { exp?: number };
        if (decoded.exp) {
          const currentTime = Date.now() / 1000;
          const timeToExpiry = (decoded.exp - currentTime) * 1000;
          
          if (timeToExpiry <= 0) {
            handleLogout();
          } else if (timeToExpiry < 2147483647) {
            const timeoutId = setTimeout(() => {
              handleLogout();
            }, timeToExpiry);
            return () => clearTimeout(timeoutId);
          }
        }
      } catch (e) {
        console.error("Invalid token for auto-logout check");
      }
    }
  }, []);

  return (
    <header className="h-[68px] flex shrink-0 items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm z-20">
      {/* Mobile Menu Icon Placeholder */}
      <div className="flex md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-gray-500 hover:text-black transition-colors rounded-lg p-2 bg-gray-50 border border-gray-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-[260px] max-w-[80%] bg-white h-full shadow-xl flex flex-col">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black bg-gray-50 rounded-lg border border-gray-200 z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebar />
          </div>
        </div>
      )}
      
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
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors border border-transparent whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
