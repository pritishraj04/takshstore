"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Phone, CalendarDays, ShieldAlert, BadgeIndianRupee, Package, ArrowRight, UserX, UserCheck, ShieldBan } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ORDERS' | 'DRAFTS'>('ORDERS');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchCustomer();
    }, [resolvedParams.id]);

    const fetchCustomer = async () => {
        try {
            const res = await adminApiFetch(`/admin/customers/${resolvedParams.id}`);
            if (!res.ok) throw new Error("Customer unretrievable.");
            setUser(await res.json());
        } catch (e: any) {
            toast.error(e.message);
            router.push('/admin/customers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
        if (!window.confirm(`Escalating Protocol: Force account into ${newStatus}?`)) return;
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/customers/${user.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to patch status.");
            toast.success(`Identity status overriden to ${newStatus}.`);
            fetchCustomer();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading || !user) {
        return <div className="animate-pulse space-y-6 flex flex-col items-center justify-center min-h-[500px] text-gray-400 font-medium">Resolving Profile Identity...</div>;
    }

    const { orders = [] } = user;
    const allDigitalItems = orders.flatMap((o: any) => o.items).filter((i: any) => i.digitalInvite);
    
    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in">
            {/* Nav Header */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
                <Link href="/admin/customers" className="p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                   <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                   <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                       {user.name || 'Anonymous User'}
                       <span className={`px-2.5 py-1 uppercase tracking-widest text-[9px] font-extrabold rounded-md shadow-sm border ${
                           user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                           user.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                           'bg-red-50 text-red-700 border-red-200'
                       }`}>
                           {user.status}
                       </span>
                   </h1>
                   <p className="text-gray-500 text-sm mt-0.5">Deep inspection of behavioral transactions and access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column - Core ID */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border text-sm border-gray-100 shadow-sm rounded-2xl overflow-hidden divide-y divide-gray-100/80">
                         <div className="p-6">
                             <h3 className="font-extrabold text-[10px] text-indigo-500 uppercase tracking-widest mb-4">Core Identity</h3>
                             <div className="space-y-4">
                               <div className="flex items-center gap-3 text-gray-700"><User className="w-4 h-4 text-gray-400" /> <span className="font-medium">{user.name || '-'}</span></div>
                               <div className="flex items-center gap-3 text-gray-700"><Mail className="w-4 h-4 text-gray-400" /> <span className="font-medium">{user.email}</span></div>
                               <div className="flex items-center gap-3 text-gray-700"><Phone className="w-4 h-4 text-gray-400" /> <span className="font-medium">{user.phone || 'No phone recorded'}</span></div>
                               <div className="flex items-center gap-3 text-gray-700"><CalendarDays className="w-4 h-4 text-gray-400" /> <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                             </div>
                         </div>
                         <div className="p-6 bg-gray-50/50">
                             <h3 className="font-extrabold text-[10px] text-emerald-500 uppercase tracking-widest mb-4">Yield Metrics</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                                    <BadgeIndianRupee className="w-5 h-5 mx-auto text-emerald-600 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-gray-900">₹{user.lifetimeValue?.toLocaleString()}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">Acquired</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                                    <Package className="w-5 h-5 mx-auto text-indigo-600 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-gray-900">{user._count?.orders}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">Checkout Hits</div>
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="bg-red-50/50 border border-red-100 shadow-sm rounded-2xl p-6">
                        <h3 className="font-extrabold text-[10px] text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> Danger Operations</h3>
                        <p className="text-xs text-red-800/80 mb-5 leading-relaxed">Adjusting state limits customer purchasing behaviors automatically restricting platform API usage.</p>
                        <div className="flex flex-col gap-2">
                             {user.status !== 'SUSPENDED' && (
                                <button disabled={isUpdating} onClick={() => handleStatusUpdate('SUSPENDED')} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-100 text-amber-800 text-sm font-bold rounded-xl hover:bg-amber-200 transition-colors">
                                    <UserX className="w-4 h-4" /> Issue Suspension State
                                </button>
                             )}
                             {user.status !== 'BANNED' && (
                                <button disabled={isUpdating} onClick={() => handleStatusUpdate('BANNED')} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-600 text-white shadow-sm text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
                                    <ShieldBan className="w-4 h-4" /> Purge & Permanent Ban
                                </button>
                             )}
                             {user.status !== 'ACTIVE' && (
                                <button disabled={isUpdating} onClick={() => handleStatusUpdate('ACTIVE')} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl hover:bg-emerald-200 transition-colors">
                                    <UserCheck className="w-4 h-4" /> Restore Civilian Access
                                </button>
                             )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Deep Table Matrix */}
                <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
                     <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
                         <button onClick={() => setActiveTab('ORDERS')} className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'ORDERS' ? 'text-indigo-700 bg-white border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border-b-2 border-transparent'}`}>
                             Receipt History ({orders.length})
                         </button>
                         <button onClick={() => setActiveTab('DRAFTS')} className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'DRAFTS' ? 'text-emerald-700 bg-white border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border-b-2 border-transparent'}`}>
                             Digital Blueprints ({allDigitalItems.length})
                         </button>
                     </div>

                     <div className="flex-1 overflow-y-auto">
                        {activeTab === 'ORDERS' && (
                            <table className="w-full text-sm text-left">
                               <thead className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest bg-white border-b border-gray-100 sticky top-0">
                                   <tr>
                                       <th className="px-6 py-4">Receipt ID</th>
                                       <th className="px-6 py-4">Status</th>
                                       <th className="px-6 py-4 text-right">Yield</th>
                                       <th className="px-6 py-4 text-right"></th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-50">
                                   {orders.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No financial transactions recorded.</td></tr> : orders.map((o: any) => (
                                       <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                                           <td className="px-6 py-4 font-bold text-gray-900">#{o.id.slice(0,8).toUpperCase()} <span className="text-[10px] block font-medium text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span></td>
                                           <td className="px-6 py-4">
                                               <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${o.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                                           </td>
                                           <td className="px-6 py-4 font-bold text-right text-gray-900">₹{o.totalAmount}</td>
                                           <td className="px-6 py-4 text-right">
                                               <Link href={`/admin/orders`} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100 opacity-0 group-hover:opacity-100 w-fit">
                                                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                                               </Link>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                            </table>
                        )}

                        {activeTab === 'DRAFTS' && (
                            <div className="divide-y divide-gray-50">
                                {allDigitalItems.length === 0 ? <p className="p-12 text-center text-gray-400 font-medium">No customizer blueprints linked.</p> : allDigitalItems.map((item: any) => {
                                    const draft = item.digitalInvite;
                                    return (
                                     <div key={draft.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                                         <div>
                                            <h4 className="font-bold text-gray-900 text-base">{draft.originalBrideName || 'TBD'} & {draft.originalGroomName || 'TBD'}</h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                               <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${draft.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{draft.status}</span>
                                               <span className="text-xs font-medium text-gray-500 tracking-wider uppercase flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {draft.originalEventDate ? new Date(draft.originalEventDate).toLocaleDateString() : 'Unscheduled'}</span>
                                            </div>
                                         </div>
                                         <Link href={`/admin/media`} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100">
                                             Trace Media
                                         </Link>
                                     </div>
                                )})}
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
}
