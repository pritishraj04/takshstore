"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { Tag, Plus, Trash2, Edit3, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function TagsPage() {
    const [tags, setTags] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');

    const fetchTags = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch('/admin/tags');
            if (res.ok) setTags(await res.json());
        } catch (error) {
            toast.error('Failed to load global tags');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newSlug) return;
        
        setIsCreating(true);
        try {
            const res = await adminApiFetch('/admin/tags', {
                method: 'POST',
                body: JSON.stringify({ name: newName, slug: newSlug }),
            });
            if (res.ok) {
                toast.success('Tag established in global index');
                setNewName('');
                setNewSlug('');
                fetchTags();
            } else {
                const err = await res.json();
                throw new Error(err.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Establishment failure');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you certain you wish to deallocate this tag? This action is irreversible.')) return;
        
        try {
            const res = await adminApiFetch(`/admin/tags/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Tag deallocated securely');
                fetchTags();
            } else {
                const err = await res.json();
                throw new Error(err.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Deallocation halted');
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-bottom duration-500 fade-in">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2 uppercase">
                    <Tag size={28} className="text-violet-600" /> Tag Classification
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage custom product categories and supervise automated system-level engagement badges.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Terminal */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-orange-500" /> Establish Tag Identity
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">DisplayName</label>
                                <input 
                                    type="text" 
                                    value={newName} 
                                    onChange={e => {
                                        setNewName(e.target.value);
                                        if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white text-sm transition-all" 
                                    placeholder="e.g. Summer Sale" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Unique Slug</label>
                                <input 
                                    type="text" 
                                    value={newSlug} 
                                    onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white text-sm font-mono transition-all" 
                                    placeholder="summer-sale" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isCreating || !newName || !newSlug}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Zap className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Commit to Index
                            </button>
                        </form>
                    </div>
                </div>

                {/* Classification Index */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Classification</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Slug Index</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Origin</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-20 text-center"><Zap className="w-6 h-6 text-orange-200 animate-pulse mx-auto" /></td></tr>
                                ) : tags.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium">No classification records found.</td></tr>
                                ) : tags.map(tag => (
                                    <tr key={tag.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tag.isSystem ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Tag className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-gray-900">{tag.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{tag.slug}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tag.isSystem ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                                    <ShieldCheck className="w-3 h-3" /> System Logic
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">Manual Entry</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!tag.isSystem && (
                                                <button 
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
