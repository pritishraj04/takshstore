"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Mail, Palette, Users, Tag, Image as ImageIcon, Shield, Package } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products / Catalog', href: '/admin/catalog', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'S3 Media', href: '/admin/media', icon: ImageIcon },
  { name: 'Team & Access', href: '/admin/team', icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full py-6 flex flex-col bg-white overflow-hidden">
      <div className="px-6 mb-8 mt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-black">Taksh Portal</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          // Exact match for /admin to prevent all routes triggering the root dashboard active state
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 transition-all text-sm font-medium ${
                isActive
                  ? 'bg-gray-100 text-black border-r-4 border-black'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-r-4 border-transparent'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-black' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
