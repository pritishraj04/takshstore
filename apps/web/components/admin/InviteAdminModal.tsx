"use client";

import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApiFetch } from '@/lib/admin-api';

const PERMISSION_MODULES = [
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'products', label: 'Products & Collection' },
  { id: 'categories', label: 'Catalog Categories' },
  { id: 'reviews', label: 'Product Reviews' },
  { id: 'media', label: 'S3 Media' },
  { id: 'cms', label: 'CMS & Policies' },
  { id: 'journals', label: 'Journals' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'settings', label: 'Global Settings' },
  { id: 'subAdmins', label: 'Team & Sub-Admins' },
];

export function InviteAdminModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePermissionChange = (moduleId: string, level: string) => {
    setPermissions(prev => ({ ...prev, [moduleId]: level }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map missing module permutations automatically to NONE securely
      const finalPermissions: Record<string, string> = {};
      PERMISSION_MODULES.forEach(mod => {
        finalPermissions[mod.id] = permissions[mod.id] || 'NONE';
      });

      const res = await adminApiFetch('/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify({ name, email, permissions: finalPermissions }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send invite');
      }

      toast.success('Invitation sent securely to user.');

      // Reset logic
      setName('');
      setEmail('');
      setPermissions({});

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100/80 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50/50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100/50">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Invite Sub-Admin</h3>
              <p className="text-xs text-gray-500 font-medium tracking-wide mt-0.5">Issue granular access scopes to new operational members.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-8 overflow-y-auto flex-1 space-y-10">

            {/* Core PII */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest flex items-center gap-3">
                <span className="h-px bg-blue-100 w-6 block"></span>
                Profile Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 tracking-tight mb-2">Display Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white text-sm transition-all shadow-sm placeholder:text-gray-400" placeholder="e.g. System Maintainer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 tracking-tight mb-2">Secure Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white text-sm transition-all shadow-sm placeholder:text-gray-400" placeholder="e.g. root@takshstore.com" />
                </div>
              </div>
            </div>

            {/* RBAC Grid */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-3">
                <span className="h-px bg-indigo-100 w-6 block"></span>
                Sub-System Authorizations
              </h4>

              <div className="bg-white rounded-xl border border-gray-200/80 divide-y divide-gray-100 shadow-sm overflow-hidden text-sm">
                {PERMISSION_MODULES.map((mod) => {
                  const val = permissions[mod.id] || 'NONE';
                  return (
                    <div key={mod.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-gray-50/50 transition-colors gap-3 sm:gap-0">
                      <div>
                        <span className="font-bold text-gray-900">{mod.label}</span>
                        <p className="text-[11px] font-medium text-gray-400">Specify explicit clearance level.</p>
                      </div>
                      <div className="flex bg-gray-100/80 rounded-lg p-1 shadow-sm w-fit border border-gray-200/50">
                        {['NONE', 'READ', 'WRITE'].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handlePermissionChange(mod.id, level)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all tracking-wider ${val === level
                                ? level === 'NONE' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' :
                                  level === 'READ' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200' :
                                    'bg-white text-indigo-600 shadow-sm border border-indigo-200'
                                : 'text-gray-500 hover:text-gray-900 border border-transparent'
                              }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-gray-400 font-medium px-2 italic">By default, all undetermined modules automatically regress to `NONE` safely dropping unlisted access.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-colors border border-gray-200 shadow-sm bg-white/50 w-full sm:w-auto text-center whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-6 py-2.5 text-sm font-bold bg-black text-white hover:bg-gray-900 rounded-xl shadow-md transition-colors disabled:opacity-50 whitespace-nowrap">
              {isSubmitting ? 'Dispatching Protocol...' : <><UserPlus className="w-4 h-4" /> Dispatch Setup Email</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
