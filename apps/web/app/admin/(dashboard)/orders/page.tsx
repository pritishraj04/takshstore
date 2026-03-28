"use client";

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import { OrderActionMenu } from '@/components/admin/OrderActionMenu';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/orders?search=${searchQuery}&status=${statusFilter}`);
            if (res.ok) {
                const json = await res.json();
                setOrders(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 300); // debounce search
        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter]);

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Management</h1>
                  <p className="text-gray-500 text-sm mt-1">Review, monitor, and directly alter incoming customer orders.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    <Link
                        href="/admin/orders/new"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors whitespace-nowrap"
                    >
                        + Create Manual Order
                    </Link>

                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders, emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 text-sm font-medium border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black bg-white transition-colors cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-gray-500 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100/80">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                       <div className="flex animate-pulse items-center justify-center space-x-2">
                                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                       </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <PackageX className="w-10 h-10 mb-3 text-gray-300" />
                                            <p className="font-medium">No orders found</p>
                                            <p className="text-sm mt-1 text-gray-400">Check active filters or search phrases.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map((order) => {
                                const hasDigital = order.items.some((i: any) => i.product?.type === 'DIGITAL');
                                const hasPhysical = order.items.some((i: any) => i.product?.type === 'PHYSICAL');
                                
                                let typeLabel = 'Canvas Art';
                                let typeColorClass = 'bg-orange-50 text-orange-700';
                                
                                if (hasDigital && hasPhysical) {
                                  typeLabel = 'Mixed Order';
                                  typeColorClass = 'bg-teal-50 text-teal-700';
                                } else if (hasDigital) {
                                  typeLabel = 'Digital Invite';
                                  typeColorClass = 'bg-indigo-50 text-indigo-700';
                                }

                                const invite = order.items.find((i: any) => i.digitalInvite)?.digitalInvite;

                                return (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900 tracking-tight">
                                        <Link href={`/admin/orders/${order.id}`} className="hover:text-indigo-600 hover:underline transition-colors">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/customers/${order.user.id}`} className="font-semibold text-gray-900 transition-colors hover:text-indigo-600 hover:underline">{order.user.name || 'Anonymous'}</Link>
                                        <div className="text-xs text-gray-500 mt-0.5">{order.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${typeColorClass}`}>
                                            {typeLabel}
                                        </span>
                                        <div className="text-[10px] text-gray-500 mt-1 max-w-[180px] truncate font-medium">
                                            {order.items.map((i: any) => `${i.quantity}x ${i.product?.title || 'Unknown'}`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs font-medium">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase
                                                ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                                                  order.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                                                  'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                            {order.isManual && (
                                                <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-900 text-white shadow-sm">
                                                    Manual
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <OrderActionMenu order={order} digitalInvite={invite} onUpdate={fetchOrders} />
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
