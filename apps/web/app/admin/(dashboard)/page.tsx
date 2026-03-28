"use client";

import { useQuery } from '@tanstack/react-query';
import { IndianRupee, ShoppingCart, Users, Package, Clock } from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
import { adminApiFetch } from '@/lib/admin-api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalRevenue: number;
  pipelineItems: number;
  completedItems: number;
  totalCustomers: number;
  recentActivity: any[];
  revenueChart: { name: string; total: number }[];
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApiFetch('/admin/dashboard/overview');
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[380px]" />
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[380px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-bottom">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Metrics, analytics, and ecosystem controls.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={0}
          trendLabel="from paid orders"
        />
        <MetricCard
          title="Fulfillment Queue"
          value={String(data?.pipelineItems || 0)}
          icon={Clock}
          trend={0}
          trendLabel="items awaiting action"
        />
        <MetricCard
          title="Total Customers"
          value={String(data?.totalCustomers || 0)}
          icon={Users}
          trend={0}
          trendLabel="registered accounts"
        />
        <MetricCard
          title="Completed Items"
          value={String(data?.completedItems || 0)}
          icon={Package}
          trend={0}
          trendLabel="delivered & published"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
          <span className="w-2 h-6 bg-black rounded-sm inline-block" />
          Revenue — Last 6 Months
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueChart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <RechartsTooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" name="Revenue" dataKey="total" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-gray-900 rounded-sm inline-block" />
            Recent Orders
          </h3>
        </div>

        {!data?.recentActivity?.length ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-sm">No recent activity yet.</p>
          </div>
        ) : (
          <div className="space-y-5 pl-2">
            {data.recentActivity.map((order: any, index: number) => {
              const isLast = index === data.recentActivity.length - 1;
              const productTitle = (order.items || []).map((item: any) => 
                `${item.quantity}x ${item.product?.title || 'Unknown Product'}`
              ).join(', ') || 'Custom Order';
              const customerName = order.user?.name || order.user?.email || 'Customer';
              const timeAgo = formatTimeAgo(new Date(order.createdAt));

              return (
                <div key={order.id} className="flex gap-5 group">
                  <div className="relative flex flex-col items-center">
                    {!isLast && (
                      <div className="absolute top-10 bottom-[-20px] w-px bg-gray-200 group-hover:bg-gray-300 transition-colors" />
                    )}
                    <div className="w-[42px] h-[42px] rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-500 z-10 group-hover:border-black group-hover:text-black transition-all shadow-sm">
                      <ShoppingCart className="w-[18px] h-[18px]" />
                    </div>
                  </div>
                  <div className="pt-2 pb-4 flex-1">
                    <p className="text-[15px] font-medium text-gray-900 tracking-tight line-clamp-1">
                      New order by <span className="font-bold">{customerName}</span> — {productTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-400">{timeAgo}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
