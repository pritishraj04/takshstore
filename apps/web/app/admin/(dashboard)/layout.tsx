import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Desktop Sidebar Fixed Container */}
      <div className="hidden md:block w-[260px] shrink-0 bg-white border-r border-gray-200 z-10 shadow-sm">
        <AdminSidebar />
      </div>

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 lg:p-10 pb-20 scroll-smooth">
          <div className="max-w-[1400px] mx-auto w-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
