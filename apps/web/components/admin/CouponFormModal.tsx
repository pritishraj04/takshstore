"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { Tag, Plus, Settings2, Trash2, Power, PowerOff, Sparkles, UploadCloud } from 'lucide-react';

export function CouponFormModal({
    isOpen,
    onClose,
    onSuccess,
    initialData = null
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Core payload mappings
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('');

    // Limits
    const [maxUses, setMaxUses] = useState('');
    const [validUntil, setValidUntil] = useState('');

    const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(false);
    const [homeBannerImage, setHomeBannerImage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setCode(initialData.code || '');
            setDescription(initialData.description || '');
            setDiscountType(initialData.discountType || 'PERCENTAGE');
            setDiscountValue(initialData.discountValue?.toString() || '');
            setMaxUses(initialData.maxUses?.toString() || '');

            if (initialData.validUntil) {
                // Formatting to YYYY-MM-DD string for HTML date input securely natively
                const d = new Date(initialData.validUntil);
                setValidUntil(d.toISOString().slice(0, 10));
            } else {
                setValidUntil('');
            }
            setIsFeaturedOnHome(initialData.isFeaturedOnHome || false);
            setHomeBannerImage(initialData.homeBannerImage || '');
            setPreviewUrl(initialData.homeBannerImage || null);
            setSelectedFile(null);

        } else if (isOpen) {
            // Reset state
            setCode(''); setDescription(''); setDiscountType('PERCENTAGE'); setDiscountValue('');
            setMaxUses(''); setValidUntil('');
            setIsFeaturedOnHome(false); setHomeBannerImage(''); setSelectedFile(null); setPreviewUrl(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = 'STITCH';
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        setCode(res);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const val = parseFloat(discountValue);
        if (discountType === 'PERCENTAGE' && val > 100) {
            toast.error('Percentages cannot exceed 100.');
            setIsSubmitting(false);
            return;
        }

        let finalImageUrl = homeBannerImage;
        if (selectedFile) {
            toast.loading('Uploading banner...', { id: 'upload-toast' });
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await adminApiFetch('admin/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('Image upload failed');
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
                toast.success('Banner uploaded successfully', { id: 'upload-toast' });
            } catch (err) {
                toast.error('Banner upload failed. Cannot save vector.', { id: 'upload-toast' });
                setIsSubmitting(false);
                return;
            }
        }

        const payload: any = {
            code,
            description: description || undefined,
            discountType,
            discountValue: val,
            isFeaturedOnHome,
            homeBannerImage: finalImageUrl,
        };

        if (maxUses) payload.maxUses = parseInt(maxUses, 10);
        if (validUntil) payload.validUntil = new Date(validUntil).toISOString();

        try {
            const endpoint = initialData ? `/admin/coupons/${initialData.id}` : '/admin/coupons';
            const method = initialData ? 'PUT' : 'POST';

            const res = await adminApiFetch(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Operation failed');
            }

            toast.success(`Promotional Vector ${initialData ? 'reconstructed' : 'launched'} securely.`);
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">{initialData ? 'Reconstruct Vector' : 'Establish New Promotion'}</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Control pricing logic aggressively masking explicit calculations over customer checkouts globally.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-white p-8 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-3 mb-4"><span className="h-px bg-indigo-100 w-6 flex"></span> Core Targeting</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Secret Voucher Syntax</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-bold tracking-wider text-sm uppercase text-gray-900" placeholder="e.g. WEDDING20" />
                                    <button type="button" onClick={generateCode} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 font-bold text-xs flex items-center gap-2 border border-gray-200 whitespace-nowrap"><Sparkles className="w-4 h-4 text-amber-500" /> Generate</button>
                                </div>
                                <p className="text-[10px] font-medium text-gray-500 mt-1.5 uppercase tracking-wide">Must explicitly map identical string values protecting logic cleanly. Code auto-formats strictly uppercase.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Internal Description Target</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" placeholder="e.g. Influencer Spring Campaign" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest flex items-center gap-3 mb-4"><span className="h-px bg-rose-100 w-6 flex"></span> Yield Disruption Matrix</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Depreciation Architecture</label>
                                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                                    <button type="button" onClick={() => setDiscountType('PERCENTAGE')} className={`flex-1 py-3 text-xs font-bold transition-colors ${discountType === 'PERCENTAGE' ? 'bg-white text-indigo-700 border-r border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{`% PERCENT`}</button>
                                    <button type="button" onClick={() => setDiscountType('FIXED_AMOUNT')} className={`flex-1 py-3 text-xs font-bold transition-colors ${discountType === 'FIXED_AMOUNT' ? 'bg-white text-emerald-700 border-l border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{`₹ FLAT OFF`}</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">Value Limit Scale</label>
                                <input type="number" min="0" step={discountType === 'PERCENTAGE' ? '1' : '0.01'} value={discountValue} onChange={e => setDiscountValue(e.target.value)} required className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold ${discountType === 'PERCENTAGE' ? 'focus:border-indigo-500 text-indigo-800' : 'focus:border-emerald-500 text-emerald-800'}`} placeholder={discountType === 'PERCENTAGE' ? '0%' : '₹0.00'} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-3 mb-4"><span className="h-px bg-amber-100 w-6 flex"></span> Bounding Constraints</h4>
                        <div className="p-5 border border-amber-100 bg-amber-50/30 rounded-xl grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 mb-1.5 flex justify-between">Global Redemptions <span className="text-[9px] text-gray-400">Blank = ∞</span></label>
                                <input type="number" min="1" step="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-400 text-sm" placeholder="e.g. 100" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 mb-1.5 flex justify-between">Demise Protocol <span className="text-[9px] text-gray-400">Blank = Immunity</span></label>
                                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-400 text-sm font-mono text-gray-600 uppercase" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-extrabold text-teal-500 uppercase tracking-widest flex items-center gap-3 mb-4"><span className="h-px bg-teal-100 w-6 flex"></span> Homepage Spotlight</h4>
                        <div className="p-5 border border-teal-100 bg-teal-50/30 rounded-xl space-y-5">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isFeatured" checked={isFeaturedOnHome} onChange={e => setIsFeaturedOnHome(e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer" />
                                <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Feature this promo on the storefront homepage (displaces any existing featured promo).</label>
                            </div>
                            
                            {isFeaturedOnHome && (
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2"><UploadCloud className="w-3.5 h-3.5" /> Spotlight Banner Graphic</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl p-6 flex flex-col items-center justify-center bg-white transition-all overflow-hidden h-40">
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                    setHomeBannerImage(''); 
                                                }
                                            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            {previewUrl || homeBannerImage ? (
                                                <img src={previewUrl || homeBannerImage} alt="Banner Preview" className="h-full object-contain" />
                                            ) : (
                                                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-teal-400 transition-colors" />
                                                    <p className="text-xs font-medium text-gray-500">Drag & drop wide banner graphic</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block shrink-0">OR URI:</span>
                                            <input type="url" value={homeBannerImage} onChange={e => { setHomeBannerImage(e.target.value); setSelectedFile(null); setPreviewUrl(null); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-teal-400 text-sm" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200 transition-colors bg-white rounded-xl whitespace-nowrap">Hold Deploy</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 shadow-xl transition-all rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 min-w-[140px] flex items-center justify-center whitespace-nowrap">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Execute Override'}
                    </button>
                </div>
            </div>
        </div>
    );
}
