"use client";

import { useState, useEffect, Suspense } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { Package, RadioReceiver, Edit3, Eye, EyeOff, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { useSearchParams, useRouter } from 'next/navigation';

function CatalogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'CANVAS' | 'DIGITAL') || 'CANVAS';

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/products?category=${activeTab}`);
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            toast.error('Failed to load catalog');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [activeTab]);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const res = await adminApiFetch(`/admin/products/${id}/toggle-status`, { method: 'PATCH' });
            if (!res.ok) throw new Error();
            toast.success(`Product swapped to ${currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'} state securely.`);
            fetchProducts();
        } catch (e) {
            toast.error('Phase flip execution halted.');
        }
    };

    const handleEdit = (prod: any) => {
        setEditingProduct(prod);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2 uppercase">
                        <Package size={28} className="text-emerald-600" /> Catalog Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Supervise, price, and align dynamic interactive canvases across public endpoints.</p>
                </div>
                <button onClick={handleAddNew} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 group">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Bind New Blueprint
                </button>
            </div>

            <div className="flex gap-2 border-b border-gray-200 shrink-0 mt-8">
                <button
                    onClick={() => router.push('/admin/catalog?tab=CANVAS')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'CANVAS' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Package className="w-4 h-4" /> Hard Canvas Artworks
                </button>
                <button
                    onClick={() => router.push('/admin/catalog?tab=DIGITAL')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'DIGITAL' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <RadioReceiver className="w-4 h-4" /> Software Level Invites
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-auto flex-1 h-full relative">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10 backdrop-blur-md bg-gray-50/90 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Asset Signature</th>
                                <th className="px-6 py-4 whitespace-nowrap">Value Index</th>
                                {activeTab === 'CANVAS' ? (
                                    <>
                                        <th className="px-6 py-4 whitespace-nowrap">Inventory Level</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Global Engagement</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 whitespace-nowrap">NextJS React File</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Component Scope</th>
                                    </>
                                )}
                                <th className="px-6 py-4 whitespace-nowrap">Lifecycle</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Operations Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="flex justify-center"><Zap className="w-6 h-6 text-indigo-300 animate-pulse" /></div></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-24 text-center text-gray-400 font-medium">No active database records found matching this architectural classification.</td></tr>
                            ) : products.map(p => (
                                <tr key={p.id} className={`group hover:bg-gray-50/50 transition-colors ${p.status === 'DRAFT' ? 'opacity-50 hover:opacity-100' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px] font-bold uppercase tracking-wider">Empty</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.title}</div>
                                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">ID: {p.id.split('-')[0]}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 text-base flex flex-col">
                                            {p.discountedPrice ? (
                                                <>
                                                    <span className="text-emerald-600">₹{p.discountedPrice}</span>
                                                    <span className="text-xs text-gray-400 line-through">₹{p.price}</span>
                                                </>
                                            ) : (
                                                <span>₹{p.price}</span>
                                            )}
                                        </div>
                                    </td>

                                    {activeTab === 'CANVAS' ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex font-bold px-3 py-1 rounded-lg text-xs tracking-wide ${p.stockCount && p.stockCount < 5 ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'bg-gray-100 text-gray-800'}`}>
                                                    {p.stockCount ?? 'Uncapped'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-500">
                                                <span className="text-indigo-600 mr-1">{p._count?.orderItems || 0}</span> Purchases
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100/50 shadow-sm block w-fit">{p.templateSlug || 'MISSING'}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded ${p.isCustomizable ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-500'}`}>
                                                    {p.isCustomizable ? 'Dynamic React Hook' : 'Static Output'}
                                                </span>
                                            </td>
                                        </>
                                    )}

                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(p.id, p.status)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-colors border shadow-sm ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {p.status === 'ACTIVE' ? <><Eye className="w-3.5 h-3.5" /> LIVE</> : <><EyeOff className="w-3.5 h-3.5" /> HIDDEN</>}
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(p)} className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProducts}
                initialData={editingProduct}
            />
        </div>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-140px)]">
                <Zap className="w-8 h-8 text-indigo-300 animate-pulse" />
            </div>
        }>
            <CatalogContent />
        </Suspense>
    );
}
