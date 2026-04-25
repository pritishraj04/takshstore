"use client";

import { useState } from 'react';
import { MoreVertical, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';

export function OrderActionMenu({ order, digitalInvite, onUpdate }: { order: any, digitalInvite?: any, onUpdate: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGodModalOpen, setIsGodModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Modal Form State
    const defaultInviteData = typeof digitalInvite?.inviteData === 'string' ? JSON.parse(digitalInvite?.inviteData || '{}') : digitalInvite?.inviteData || {};
    const [brideName, setBrideName] = useState(digitalInvite?.originalBrideName || defaultInviteData.brideName || '');
    const [groomName, setGroomName] = useState(digitalInvite?.originalGroomName || defaultInviteData.groomName || '');
    const [eventDate, setEventDate] = useState(digitalInvite?.originalEventDate ? new Date(digitalInvite.originalEventDate).toISOString().split('T')[0] : defaultInviteData.eventDate || '');

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/orders/${order.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Status update failed');
            toast.success(`Order marked as ${newStatus}`);
            onUpdate();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    const handleForceUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/orders/${order.id}/force-update-invite`, {
                method: 'PUT',
                body: JSON.stringify({ brideName, groomName, eventDate }),
            });
            if (!res.ok) throw new Error('Force update failed');
            toast.success('Invite updated successfully. Exploit locks bypassed.');
            setIsGodModalOpen(false);
            onUpdate();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden divide-y divide-gray-100 animate-in zoom-in-95 duration-100">
                        <div className="p-1.5 min-w-[200px] text-left">
                            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Overrides</p>
                            <button
                                onClick={() => handleStatusChange('PAID')}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" /> Mark PAID
                            </button>
                            <button
                                onClick={() => handleStatusChange('PENDING')}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <Clock className="w-4 h-4 text-amber-500" /> Mark PENDING
                            </button>
                        </div>

                        {digitalInvite && (
                            <div className="p-1.5 bg-red-50/30 text-left relative">
                                <p className="px-3 py-1.5 text-[10px] font-bold text-red-400 uppercase tracking-widest">God Mode</p>
                                <button
                                    onClick={() => {
                                        setIsGodModalOpen(true);
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <ShieldAlert className="w-4 h-4" /> Force Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {isGodModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsGodModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-red-50/50">
                             <ShieldAlert className="w-5 h-5 text-red-600"/>
                             <div className="text-left">
                               <h3 className="text-lg font-bold text-gray-900 leading-tight">God Mode Override</h3>
                               <p className="text-xs text-red-600 font-medium tracking-tight">Bypassing algorithmic horizonal locks.</p>
                             </div>
                        </div>
                        <form onSubmit={handleForceUpdate} className="p-6 space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bride Name</label>
                                <input
                                    type="text"
                                    value={brideName}
                                    onChange={(e) => setBrideName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Groom Name</label>
                                <input
                                    type="text"
                                    value={groomName}
                                    onChange={(e) => setGroomName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white text-sm transition-colors"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsGodModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isUpdating ? 'Executing...' : 'Force Commit Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
