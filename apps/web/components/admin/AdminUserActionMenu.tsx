"use client";

import { useState } from 'react';
import { MoreVertical, UserMinus, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';

export function AdminUserActionMenu({ user, onUpdate }: { user: any, onUpdate: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    if (user.isSuper) {
        return (
             <div className="flex items-center justify-end px-2">
                 <ShieldAlert className="w-4 h-4 text-blue-400 mr-2 opacity-50" />
                 <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase">Protected</span>
             </div>
        );
    }

    const handleStatus = async (status: string) => {
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/users/${user.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success(`Admin status marked as ${status}`);
            onUpdate();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Permanently delete this admin and revoke all active sessions immediately?")) return;
        
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');
            toast.success('Admin permanently incinerated.');
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
            <button onClick={() => setIsOpen(!isOpen)} disabled={isUpdating} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm bg-white">
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden divide-y divide-gray-100/80 animate-in zoom-in-95 duration-100">
                        <div className="p-1.5 text-left">
                            <p className="px-3 py-1.5 text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">Access Control</p>
                            {user.status === 'SUSPENDED' ? (
                                <button onClick={() => handleStatus('ACTIVE')} className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100">
                                    <CheckCircle className="w-[18px] h-[18px]" /> Restore Access
                                </button>
                            ) : (
                                <button onClick={() => handleStatus('SUSPENDED')} className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100">
                                    <UserMinus className="w-[18px] h-[18px]" /> Suspend Invocation
                                </button>
                            )}
                        </div>
                        <div className="p-1.5 bg-red-50/50">
                            <button onClick={handleDelete} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all border border-transparent hover:border-red-200 group whitespace-nowrap">
                                <Trash2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" /> Burn Admin Layer
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
