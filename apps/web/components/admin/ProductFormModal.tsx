"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { X, Package, RadioReceiver, UploadCloud, Link as LinkIcon, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { AVAILABLE_TEMPLATES } from '@/config/templates';

export function ProductFormModal({
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
    const [type, setType] = useState<'PHYSICAL' | 'DIGITAL'>('PHYSICAL');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');

    // Media Array controls
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);

    // Physical specifics
    const [stockCount, setStockCount] = useState('');
    const [weight, setWeight] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    // Digital specifics
    const [templateSlug, setTemplateSlug] = useState('');
    const [templateWarning, setTemplateWarning] = useState<string | null>(null);
    const [defaultAudioUrl, setDefaultAudioUrl] = useState('');
    const [isCustomizable, setIsCustomizable] = useState(true);
    const [eternityAddonPrice, setEternityAddonPrice] = useState('');

    const [allTags, setAllTags] = useState<any[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const fetchTags = async () => {
        try {
            const res = await adminApiFetch('/admin/tags');
            if (res.ok) setAllTags(await res.json());
        } catch (e) {
            console.error('Failed to fetch tags', e);
        }
    };

    const handleTemplateChange = async (slug: string) => {
        setTemplateSlug(slug);
        setTemplateWarning(null);
        if (!slug) return;

        try {
            const res = await adminApiFetch(`admin/products/check-template/${slug}`);
            if (res.ok) {
                const data = await res.json();
                if (data.isUsed && data.productName !== title) {
                    setTemplateWarning(`Warning: This template is already used by the product '${data.productName}'. Creating this will result in two products selling the exact same design.`);
                }
            }
        } catch (e) {
            console.error('Template check failed', e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
        if (isOpen && initialData) {
            setType(initialData.type || 'PHYSICAL');
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setPrice(initialData.price?.toString() || '');
            setDiscountedPrice(initialData.discountedPrice?.toString() || '');
            setImageUrl(initialData.imageUrl || '');
            setImages(initialData.images || []);

            setStockCount(initialData.stockCount?.toString() || '');
            setWeight(initialData.weight?.toString() || '');
            setWidth(initialData.width?.toString() || '');
            setHeight(initialData.height?.toString() || '');

            setTemplateSlug(initialData.templateSlug || '');
            setDefaultAudioUrl(initialData.defaultAudioUrl || '');
            setIsCustomizable(initialData.isCustomizable ?? true);
            setEternityAddonPrice(initialData.eternityAddonPrice?.toString() || '');
            setTemplateWarning(null);
            setSelectedFile(null);
            setPreviewUrl(initialData.imageUrl || null);
            setSelectedTagIds(initialData.tags?.map((t: any) => t.id) || []);
        } else if (isOpen) {
            // Reset state for new entry
            setTitle(''); setDescription(''); setPrice(''); setDiscountedPrice('');
            setImageUrl(''); setImages([]); setStockCount(''); setWeight(''); setWidth(''); setHeight('');
            setTemplateSlug(''); setDefaultAudioUrl(''); setIsCustomizable(true); setEternityAddonPrice('');
            setType('PHYSICAL');
            setTemplateWarning(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setSelectedTagIds([]);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleAddImage = () => setImages([...images, '']);
    const handleUpdateImage = (index: number, val: string) => {
        const newImgs = [...images];
        newImgs[index] = val;
        setImages(newImgs);
    };
    const handleRemoveImage = (index: number) => {
        const newImgs = [...images];
        newImgs.splice(index, 1);
        setImages(newImgs);
    };

    const toggleTag = (tagId: string, isSystem: boolean) => {
        if (isSystem) return; // Prevent manual system tag toggle
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let finalImageUrl = imageUrl;
        if (selectedFile) {
            toast.loading('Uploading image...', { id: 'upload-toast' });
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
                toast.success('Image uploaded successfully', { id: 'upload-toast' });
            } catch (err) {
                toast.error('Image upload failed. Cannot save product.', { id: 'upload-toast' });
                setIsSubmitting(false);
                return;
            }
        }

        const payload: any = {
            title,
            description,
            price: parseFloat(price),
            discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
            type,
            imageUrl: finalImageUrl,
            images: images.filter(i => i.trim() !== ''), // Clean empty frames natively
            tagIds: selectedTagIds,
        };

        if (type === 'PHYSICAL') {
            payload.stockCount = stockCount ? parseInt(stockCount, 10) : undefined;
            payload.weight = weight ? parseFloat(weight) : undefined;
            payload.width = width ? parseFloat(width) : undefined;
            payload.height = height ? parseFloat(height) : undefined;
        } else {
            payload.templateSlug = templateSlug;
            payload.defaultAudioUrl = defaultAudioUrl;
            payload.isCustomizable = isCustomizable;
            payload.isDigital = true;
            payload.eternityAddonPrice = eternityAddonPrice ? parseFloat(eternityAddonPrice) : undefined;
        }

        try {
            const endpoint = initialData ? `/admin/products/${initialData.id}` : '/admin/products';
            const method = initialData ? 'PUT' : 'POST';

            const res = await adminApiFetch(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Operation failed');
            }

            toast.success(`Product ${initialData ? 'reconstructed' : 'launched'} securely.`);
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
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">{initialData ? 'Reconstruct Blueprint' : 'Establish New Identity'}</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Global catalog routing controls safely updating UI elements across user endpoints natively.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors border border-transparent shadow-sm bg-white"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-white">
                    <div className="p-8 space-y-10 flex-1">

                        {/* Domain Classification */}
                        <div>
                            <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                <span className="h-px bg-indigo-100 w-6 block"></span> Structural Domain
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" disabled={!!initialData} onClick={() => setType('PHYSICAL')} className={`flex items-center gap-3 p-4 border rounded-xl transition-all text-left ${type === 'PHYSICAL' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'PHYSICAL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}><Package className="w-5 h-5" /></div>
                                    <div>
                                        <div className={`text-sm font-bold ${type === 'PHYSICAL' ? 'text-indigo-900' : 'text-gray-700'}`}>Physical Canvas Art</div>
                                        <div className="text-[11px] font-medium text-gray-500 mt-0.5">Abstract structural paintings shipped globally.</div>
                                    </div>
                                </button>
                                <button type="button" disabled={!!initialData} onClick={() => setType('DIGITAL')} className={`flex items-center gap-3 p-4 border rounded-xl transition-all text-left ${type === 'DIGITAL' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600' : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'DIGITAL' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}><RadioReceiver className="w-5 h-5" /></div>
                                    <div>
                                        <div className={`text-sm font-bold ${type === 'DIGITAL' ? 'text-emerald-900' : 'text-gray-700'}`}>Digital Staging & Invites</div>
                                        <div className="text-[11px] font-medium text-gray-500 mt-0.5">Edge-compiled NextJS interactive blueprints.</div>
                                    </div>
                                </button>
                            </div>
                            {initialData && <p className="text-[10px] uppercase font-bold text-amber-500 mt-3 text-right">Domain locks engaged dynamically protecting relational maps. Delete and recreate to shift explicitly.</p>}
                        </div>

                        {/* Visual Frame */}
                        <div>
                            <h4 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                <span className="h-px bg-blue-100 w-6 block"></span> Presentation Matrix
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Primary Marketing Title</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-sm" placeholder="e.g. The Celestial Overlay" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Aesthetic Synopsis</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-sm min-h-24" placeholder="Describe the abstract nuances or digital features..."></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Core Valuation (₹)</label>
                                        <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-sm font-bold" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">Sale Price Override (₹) <span className="text-[10px] text-gray-400 font-medium">Leave blank for standard value</span></label>
                                        <input type="number" min="0" step="0.01" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-bold text-emerald-700" placeholder="Optional Sale Trigger" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tag Classification */}
                        <div>
                            <h4 className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                <span className="h-px bg-orange-100 w-6 block"></span> Tag Classification
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id, tag.isSystem)}
                                        disabled={tag.isSystem}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            selectedTagIds.includes(tag.id)
                                                ? tag.isSystem
                                                    ? 'bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {tag.name}
                                        {tag.isSystem && <span className="ml-1 text-[8px] uppercase opacity-60">(System)</span>}
                                    </button>
                                ))}
                                {allTags.length === 0 && <p className="text-xs text-gray-400 font-medium">No universal tags established in the global index.</p>}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Custom tags can be assigned to categorize products. System tags (Bestseller, Popular, Highly Rated) are automated based on engagement metrics.</p>
                        </div>

                        {/* Media Delivery */}
                        <div>
                            <h4 className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                <span className="h-px bg-pink-100 w-6 block"></span> S3 Media Routing
                            </h4>
                            <div className="p-5 border border-gray-200 bg-gray-50/50 rounded-xl space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2"><UploadCloud className="w-3.5 h-3.5" /> Thumbnail Art</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 hover:border-pink-400 rounded-xl p-6 flex flex-col items-center justify-center bg-white transition-all overflow-hidden h-40">
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                    setImageUrl(''); // Clear manual URL
                                                }
                                            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            {previewUrl || imageUrl ? (
                                                <img src={previewUrl || imageUrl} alt="Preview" className="h-full object-contain" />
                                            ) : (
                                                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-pink-400 transition-colors" />
                                                    <p className="text-xs font-medium text-gray-500">Drag & drop or click to upload</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block shrink-0">OR URI:</span>
                                            <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setSelectedFile(null); setPreviewUrl(null); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-pink-400 text-sm" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">Secondary Gallery Sequence
                                        <button type="button" onClick={handleAddImage} className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" /> Inject Frame</button>
                                    </label>
                                    <div className="space-y-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="flex items-center gap-2 group">
                                                <LinkIcon className="w-4 h-4 text-gray-300 shrink-0" />
                                                <input type="url" value={img} onChange={e => handleUpdateImage(i, e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-pink-400 text-sm" placeholder={`Gallery frame ${i + 1}`} />
                                                <button type="button" onClick={() => handleRemoveImage(i)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {images.length === 0 && <p className="text-xs text-gray-400 font-medium italic">No deep-view gallery imagery allocated for detail pages currently.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditional Physical Mapping */}
                        {type === 'PHYSICAL' && (
                            <div className="bg-indigo-50/30 p-6 rounded-xl border border-indigo-100/50 animate-in fade-in slide-in-bottom-4 duration-300">
                                <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                    <span className="h-px bg-indigo-200 w-6 block"></span> Logistical Shipping Data
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">On-Hand Stock</label>
                                        <input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="10" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Mass (kg)</label>
                                        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="1.5" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">X-Axis (cm)</label>
                                        <input type="number" step="0.1" value={width} onChange={e => setWidth(e.target.value)} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Y-Axis (cm)</label>
                                        <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="70" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Digital Mapping */}
                        {type === 'DIGITAL' && (
                            <div className="bg-emerald-50/30 p-6 rounded-xl border border-emerald-100/50 animate-in fade-in slide-in-top-4 duration-300">
                                <h4 className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-3 mb-4">
                                    <span className="h-px bg-emerald-200 w-6 block"></span> Engineering Architecture
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">React Component Wrapper Slug</label>
                                        <select value={templateSlug} onChange={e => handleTemplateChange(e.target.value)} required className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-mono text-emerald-800">
                                            <option value="">Select a template...</option>
                                            {AVAILABLE_TEMPLATES.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] font-medium text-gray-500 mt-1.5 uppercase tracking-wide">Must explicitly map identical string values tracking NextJS file blocks natively.</p>
                                        {templateWarning && (
                                            <div className="mt-3 bg-yellow-50 border border-yellow-400 text-yellow-800 p-3 rounded-lg flex gap-3 items-start animate-in fade-in">
                                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                                <p className="text-xs font-medium leading-relaxed">{templateWarning}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">Baseline Ambient Audio URI</label>
                                        <input type="url" value={defaultAudioUrl} onChange={e => setDefaultAudioUrl(e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 text-sm" placeholder="https://...mp3" />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-3 border border-emerald-100 rounded-lg w-fit mt-2 shadow-sm">
                                        <input type="checkbox" id="isCust" checked={isCustomizable} onChange={e => setIsCustomizable(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer" />
                                        <label htmlFor="isCust" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Engage Customizer Engine explicitly restricting hard-coded blocks.</label>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Eternity Add-on Price (₹)</label>
                                        <input type="number" min="0" step="0.01" value={eternityAddonPrice} onChange={e => setEternityAddonPrice(e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-emerald-700" placeholder="Optional Add-on Price" />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </form>

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200 transition-colors bg-white rounded-xl">Cancel Sequence</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 shadow-xl transition-all rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 min-w-[140px] flex items-center justify-center">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Commit Output Deploy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
