"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Shield } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import { InviteAdminModal } from '@/components/admin/InviteAdminModal';
import { AdminUserActionMenu } from '@/components/admin/AdminUserActionMenu';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export default function AdminTeamPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const token = Cookies.get('admin_session');
        if (token) {
          try {
            const decoded = jwtDecode(token) as { isSuper: boolean };
            if (!decoded.isSuper) {
              router.replace('/admin');
              return;
            }
          } catch (e) {
            router.replace('/admin');
            return;
          }
        } else {
            router.replace('/admin/login');
            return;
        }

        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch('/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-3 uppercase">
                    <Shield size={32} className="text-indigo-900" /> Team & Access
                  </h1>
                  <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage RBAC Sub-Admin policies across internal ecosystem verticals.</p>
                </div>
                
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Sub-Admin
                </button>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50/50 border-b border-gray-100/80">
                            <tr>
                                <th className="px-6 py-4 w-[25%] border-r border-gray-100/50">Administrator</th>
                                <th className="px-6 py-4 w-[15%]">Status</th>
                                <th className="px-6 py-4 w-[40%]">Key Authorizations</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                                       <div className="flex animate-pulse items-center justify-center space-x-2">
                                          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                                          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                                          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                                       </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-gray-500 font-medium">
                                        No sub-admins found matching conditions.
                                    </td>
                                </tr>
                            ) : users.map((user) => {
                                const perms = user.permissions || {};
                                const writeKeys = Object.keys(perms).filter(k => perms[k] === 'WRITE' && k !== 'id' && k !== 'adminId');
                                const readKeys = Object.keys(perms).filter(k => perms[k] === 'READ' && k !== 'id' && k !== 'adminId');
                                
                                return (
                                <tr key={user.id} className="hover:bg-gray-50/40 transition-colors group">
                                    <td className="px-6 py-4 border-r border-gray-100/50">
                                        <div className="font-bold text-gray-900 flex items-center gap-2 text-[15px]">
                                            {user.name} 
                                            {user.isSuper && <Shield className="w-[14px] h-[14px] text-blue-600" />}
                                        </div>
                                        <div className="text-[13px] font-medium text-gray-500 mt-1">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase shadow-sm
                                            ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100/50' : 
                                              user.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border border-red-100/50' : 
                                              'bg-gray-100 text-gray-600 border border-gray-200/50'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isSuper ? (
                                            <span className="text-[13px] font-bold text-blue-600 tracking-tight flex items-center gap-1.5 bg-blue-50/50 w-max px-3 py-1.5 rounded-lg border border-blue-100/50">Root Access (Global Bypass Enabled)</span>
                                        ) : (
                                            <div className="flex flex-col gap-2.5 justify-center">
                                              {writeKeys.length > 0 && (
                                                <div className="text-[12px] font-bold tracking-tight flex flex-wrap items-center gap-1.5">
                                                    <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">WRITE</span>
                                                    <span className="text-gray-900 uppercase">{writeKeys.join(', ')}</span>
                                                </div>
                                              )}
                                              {readKeys.length > 0 && (
                                                <div className="text-[12px] font-bold tracking-tight flex flex-wrap items-center gap-1.5">
                                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">READ</span>
                                                    <span className="text-gray-900 uppercase">{readKeys.join(', ')}</span>
                                                </div>
                                              )}
                                              {writeKeys.length === 0 && readKeys.length === 0 && (
                                                  <span className="text-[13px] text-gray-400 font-bold tracking-tight">No implicit permissions explicitly granted.</span>
                                              )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right align-middle">
                                        <AdminUserActionMenu user={user} onUpdate={fetchUsers} />
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteAdminModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setIsInviteModalOpen(false)} 
                onSuccess={fetchUsers} 
            />
        </div>
    );
}
