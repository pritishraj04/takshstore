"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, ShoppingCart, Users, Package, Clock, Loader2, Calendar, LayoutDashboard } from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
import { adminApiFetch } from '@/lib/admin-api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { BestsellerTile } from '@/components/admin/tiles/BestsellerTile';
import { CouponTile } from '@/components/admin/tiles/CouponTile';
import { ReviewsTile } from '@/components/admin/tiles/ReviewsTile';
import { CustomersTile } from '@/components/admin/tiles/CustomersTile';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m' | '6m' | '1y' | 'all'>('1w');
  const [admin, setAdmin] = useState<{ isSuper: boolean; permissions: string[] } | null>(null);

  useEffect(() => {
    const token = Cookies.get('admin_session');
    if (token) {
      try {
        const decoded = jwtDecode(token) as any;
        const perms: string[] = [];
        if (decoded.permissions) {
          Object.entries(decoded.permissions).forEach(([module, level]) => {
            if (level !== 'NONE') {
              perms.push(`view:${module}`);
            }
          });
        }
        setAdmin({
          isSuper: decoded.isSuper || false,
          permissions: perms,
        });
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['admin-dashboard-unified-stats', timeframe],
    queryFn: async () => {
      const res = await adminApiFetch(`/admin/dashboard?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    enabled: !!admin
  });

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    return admin.isSuper || admin.permissions.includes(permission);
  };

  const isLoading = dataLoading || !admin;

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-xs">Assembling Your Business Intelligence...</p>
      </div>
    );
  }

  const kpis = data.kpis || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* Header with Timeframe Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3 uppercase">
            <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" /> Platform Command
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">Real-time ecosystem intelligence and command controls.</p>
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap p-1.5 bg-white border border-gray-100 rounded-3xl shadow-sm w-full xl:w-fit shrink-0 gap-1 scrollbar-hide">
          {[
            { id: '1d', label: '1D' },
            { id: '1w', label: '1W' },
            { id: '1m', label: '1M' },
            { id: '6m', label: '6M' },
            { id: '1y', label: '1Y' },
            { id: 'all', label: 'ALL' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-tighter transition-all duration-300 ${timeframe === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex items-center px-3 border-l border-gray-50 ml-1">
            <Calendar className="w-3.5 h-3.5 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Time-Filtered Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue"
          value={`₹${(kpis.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={0}
          trendLabel={`in the last ${timeframe.toUpperCase()}`}
        />
        <MetricCard
          title="Fulfillment"
          value={String(kpis.pipelineItems || 0)}
          icon={Clock}
          trend={0}
          trendLabel="items awaiting action"
        />
        <MetricCard
          title="User Base"
          value={String(kpis.totalCustomers || 0)}
          icon={Users}
          trend={0}
          trendLabel="acquired in timeframe"
        />
        <MetricCard
          title="Successful Sales"
          value={String(kpis.completedItems || 0)}
          icon={Package}
          trend={0}
          trendLabel="completed deliveries"
        />
      </div>

      {/* Analytics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasPermission('view:products') && (
          <BestsellerTile products={data.bestsellers} />
        )}
        {hasPermission('view:coupons') && (
          <CouponTile data={data.coupons} />
        )}
        {hasPermission('view:customers') && (
          <CustomersTile count={data.newCustomers} />
        )}
      </div>

      {/* Unified Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
          <h3 className="text-lg sm:text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3">
            <span className="w-2 sm:w-2.5 h-6 sm:h-7 bg-indigo-600 rounded-sm inline-block shrink-0" />
            REVENUE TRAJECTORY
          </h3>
          <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Units: Indian Rupee (INR)
          </span>
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotalUnified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} dx={-5} />
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
              <RechartsTooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" name="Revenue" dataKey="total" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotalUnified)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Reviews (Time-Filtered) */}
        {hasPermission('view:reviews') && (
          <ReviewsTile reviews={data.reviews} />
        )}

        {/* Unified Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
            <h3 className="text-lg sm:text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3">
              <span className="w-2 sm:w-2.5 h-6 sm:h-7 bg-black rounded-sm inline-block shrink-0" />
              SYSTEM ACTIVITY
            </h3>
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Live Log
            </span>
          </div>

          {!data.recentActivity?.length ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No records for this timeframe.</p>
            </div>
          ) : (
            <div className="space-y-6 pl-2 max-h-[440px] overflow-y-auto scrollbar-hide pr-2">
              {data.recentActivity.map((order: any, index: number) => {
                const isLast = index === data.recentActivity.length - 1;
                const productTitle = (order.items || []).map((item: any) =>
                  `${item.quantity}x ${item.product?.title || 'Unknown Product'}`
                ).join(', ') || 'Custom Order';
                const customerName = order.user?.name || order.user?.email || 'Customer';
                const timeAgo = formatTimeAgo(new Date(order.createdAt));

                return (
                  <div key={order.id} className="flex gap-5 group">
                    <div className="relative flex flex-col items-center shrink-0">
                      {!isLast && (
                        <div className="absolute top-10 bottom-[-24px] w-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                      )}
                      <div className="w-[48px] h-[48px] rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 z-10 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all shadow-sm group-hover:shadow-indigo-100">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="pt-1.5 pb-6 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:gap-0 gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          New order: <span className="text-indigo-600">{customerName}</span>
                        </p>
                        <span className="text-sm font-black text-gray-900 shrink-0">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium truncate mt-1">{productTitle}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{timeAgo}</span>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                          ${order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' :
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-gray-50 text-gray-600 border-gray-100'}`}>
                          {order.status}
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
