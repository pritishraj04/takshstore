"use client";

import { useState, useEffect } from 'react';
import { Search, Eye, Users } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/customers?search=${searchQuery}`);
            if (res.ok) setCustomers(await res.json());
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch customers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2 uppercase">
                    <Users size={28} className="text-orange-500" /> Customer Repository
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">Aggregated profiles, lifetime spending, and behavioral analytics.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find by name, email, or exact phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-gray-500 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100/80">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Customer Identity</th>
                                <th className="px-6 py-4 font-semibold">Date Acquired</th>
                                <th className="px-6 py-4 font-semibold">Total Orders</th>
                                <th className="px-6 py-4 font-semibold">Lifetime Yield</th>
                                <th className="px-6 py-4 font-semibold">Platform Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Insight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                       <div className="flex animate-pulse items-center justify-center space-x-2">
                                          <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                          <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                          <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                       </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users className="w-10 h-10 mb-3 text-gray-300" />
                                            <p className="font-medium">No matching demographics.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-indigo-100">
                                               {user.name ? user.name.slice(0,2) : ((user.email || 'A').slice(0,2))}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 leading-tight">{user.name || 'Anonymous Customer'}</div>
                                                <div className="text-xs text-gray-500">{user.email} {user.phone ? `• ${user.phone}` : ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 font-bold bg-gray-100 text-gray-800 rounded-lg text-xs">{user.totalOrders}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-700">
                                        ₹{user.lifetimeValue?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200/50' :
                                            user.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                                            'bg-red-50 text-red-700 border border-red-200/50'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/customers/${user.id}`} className="inline-flex p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 shadow-sm bg-white">
                                           <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
