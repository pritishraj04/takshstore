"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { Tag, Edit3, ShieldX, Zap, Eye, EyeOff, Plus, FileQuestion, Sparkles, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { CouponFormModal } from '@/components/admin/CouponFormModal';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/coupons`);
            if (res.ok) setCoupons(await res.json());
        } catch (error) {
            toast.error('Failed to load promotional architecture');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleToggleStatus = async (id: string, code: string) => {
        try {
            const res = await adminApiFetch(`/admin/coupons/${id}/toggle`, { method: 'PATCH' });
            if (!res.ok) throw new Error();
            toast.success(`Vector ${code} toggled securely.`);
            fetchCoupons();
        } catch (e) {
            toast.error('Phase flip execution halted.');
        }
    };

    const isExpired = (validUntil: string | null) => {
        if (!validUntil) return false;
        return new Date(validUntil).getTime() < new Date().getTime();
    };

    const isMaxedOut = (c: any) => {
        if (!c.maxUses) return false;
        return c.currentUses >= c.maxUses;
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 shrink-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3 uppercase">
                    <Ticket className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-rose-500" /> Coupon Engineering
                  </h1>
                  <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest  text-sm sm:text-base">Supervise code networks manipulating valuation logic passively natively over customer checkouts.</p>
                </div>
                <button onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 group whitespace-nowrap w-full sm:w-auto">
                   <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Deploy New Vector
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden flex-1 flex flex-col min-h-0 mt-8">
                <div className="overflow-auto flex-1 h-full relative">
                    <table className="w-full text-sm text-left border-collapse">
                         <thead className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest bg-gray-50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                             <tr>
                                 <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Vector Sequence</th>
                                 <th className="px-6 py-4 whitespace-nowrap">Impact Valuation</th>
                                 <th className="px-6 py-4 whitespace-nowrap">Penetration Limit</th>
                                 <th className="px-6 py-4 whitespace-nowrap">Demise Horizon</th>
                                 <th className="px-6 py-4 whitespace-nowrap">Active State</th>
                                 <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Control</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                             {isLoading ? (
                                 <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="flex justify-center"><Zap className="w-6 h-6 text-amber-300 animate-pulse" /></div></td></tr>
                             ) : coupons.length === 0 ? (
                                 <tr><td colSpan={6} className="px-6 py-24 text-center text-gray-400 font-medium">No valid promo paths discovered globally.</td></tr>
                             ) : coupons.map(c => {
                                 const expired = isExpired(c.validUntil);
                                 const maxed = isMaxedOut(c);
                                 const permanentlyDead = expired || maxed;
                                 
                                 return (
                                 <tr key={c.id} className={`group hover:bg-gray-50/50 transition-colors ${permanentlyDead || !c.isActive ? 'bg-gray-50/30' : ''}`}>
                                      <td className="px-6 py-4">
                                          <div className={`font-mono text-base font-extrabold tracking-widest ${permanentlyDead ? 'text-gray-400' : 'text-gray-900 border-b-2 border-amber-400 inline-block'}`}>{c.code}</div>
                                          {c.description && <div className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">{c.description}</div>}
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border shadow-sm ${c.discountType === 'PERCENTAGE' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                              {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                          </span>
                                      </td>
                                      
                                      <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            <span className={`font-bold ${maxed ? 'text-red-500' : 'text-gray-900'}`}>{c.currentUses}</span>
                                            <span className="text-gray-300 font-medium px-1">/</span>
                                            <span className="font-medium text-gray-400">{c.maxUses ?? '∞'}</span>
                                         </div>
                                         <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                             <div className={`h-full ${maxed ? 'bg-red-500' : c.maxUses ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ width: c.maxUses ? `${Math.min((c.currentUses / c.maxUses) * 100, 100)}%` : '100%' }}></div>
                                         </div>
                                      </td>

                                      <td className="px-6 py-4">
                                          {c.validUntil ? (
                                              <span className={`text-xs font-bold ${expired ? 'text-red-500' : 'text-gray-600'}`}>
                                                  {new Date(c.validUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                                              </span>
                                          ) : (
                                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Immunity</span>
                                          )}
                                      </td>

                                      <td className="px-6 py-4">
                                          {permanentlyDead ? (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-gray-200 shadow-sm bg-gray-100 text-gray-500">
                                                  <ShieldX className="w-3.5 h-3.5" /> EXPIRED
                                              </span>
                                          ) : (
                                              <button 
                                                 onClick={() => handleToggleStatus(c.id, c.code)}
                                                 className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-colors border shadow-sm ${
                                                     c.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                                                 }`}
                                              >
                                                  {c.isActive ? <><Eye className="w-3.5 h-3.5" /> ACTIVE</> : <><EyeOff className="w-3.5 h-3.5" /> PAUSED</>}
                                              </button>
                                          )}
                                      </td>

                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => { setEditingCoupon(c); setIsModalOpen(true); }} className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors shadow-sm">
                                              <Edit3 className="w-4 h-4" />
                                          </button>
                                      </td>
                                 </tr>
                             )})}
                         </tbody>
                    </table>
                </div>
            </div>

            <CouponFormModal 
               isOpen={isModalOpen} 
               onClose={() => setIsModalOpen(false)} 
               onSuccess={fetchCoupons} 
               initialData={editingCoupon} 
            />
        </div>
    );
}
