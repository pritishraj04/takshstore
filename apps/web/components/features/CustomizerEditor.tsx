"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDigitalInvite, useUpdateInvite, useDeleteDraft } from "../../hooks/useDigitalInvite";
import { useInviteStore } from "../../store/useInviteStore";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useProducts } from "../../hooks/useProducts";
import { Loader2, ShoppingBag, ExternalLink, User, CalendarHeart, MapPin, Clock, Users, Tag, Upload, Plus, Link as LinkIcon, CheckCircle, XCircle, Save, Globe, UploadCloud, PlayCircle, Music, Edit3, Type, Images, Key, FileText, Search, AlertTriangle, Trash2, Shield } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { toast } from "sonner";
import { useUploadFile, useDeleteFile } from "../../hooks/useStorage";
import { LockedMediaUpload } from "./LockedMediaUpload";

interface CustomizerEditorProps {
    inviteId: string;
}

export default function CustomizerEditor({ inviteId }: CustomizerEditorProps) {
    const { data, isLoading, isError } = useDigitalInvite(inviteId);
    const { mutateAsync: updateInviteAsync, isPending } = useUpdateInvite(inviteId);
    const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft();
    const router = useRouter();

    // 2. Local State / Zustand Hydration
    const setAllData = useInviteStore((state) => state.setAllData);
    const currentDraft = useInviteStore((state) => state.inviteData);
    const headerRef = useRef<HTMLDivElement>(null);
    const saveBtnRef = useRef<HTMLButtonElement>(null);
    const [openSection, setOpenSection] = useState<'url' | 'couple' | 'parents' | 'events' | 'contact' | 'music' | 'messages' | null>('url');
    const [slugStatus, setSlugStatus] = useState<{ loading: boolean; available: boolean | null; suggestions: string[] }>({ loading: false, available: null, suggestions: [] });
    const [activeMobileView, setActiveMobileView] = useState<'editor' | 'preview'>('editor');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    // Storage Hooks
    const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
    const { mutateAsync: deleteFile } = useDeleteFile();

    // 3. Products & Cart
    const { data: products, isLoading: isLoadingProducts } = useProducts();
    const { addItem, setIsOpen } = useCollectionStore();
    const digitalProduct = products?.find(p => p.type === 'DIGITAL');

    // Hydrate store on mount once data is received
    useEffect(() => {
        if (data?.inviteData) {
            setAllData(data.inviteData);
        }
    }, [data, setAllData]);

    // Listen for iframe readiness
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_READY') {
                setIframeLoaded(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Broadcast draft updates to the preview iframe
    useEffect(() => {
        if (iframeLoaded && iframeRef.current?.contentWindow && currentDraft) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'UPDATE_DRAFT', payload: currentDraft },
                '*'
            );
        }
    }, [currentDraft, iframeLoaded]);

    // Derived States
    const isPurchased = data?.isPaid === true;

    // Loading GSAP
    useGSAP(() => {
        if (isLoading) {
            gsap.fromTo(
                ".loading-text",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out", repeat: -1, yoyo: true }
            );
        }
    }, [isLoading]);

    // Save Animation GSAP
    useGSAP(() => {
        if (saveBtnRef.current) {
            if (isPending) {
                gsap.to(saveBtnRef.current, { backgroundColor: "#C5B39A", color: "#1A1A1A", duration: 0.3 });
            } else {
                gsap.to(saveBtnRef.current, { backgroundColor: "transparent", color: "#1A1A1A", duration: 0.8, ease: "power2.out" });
            }
        }
    }, [isPending]);

    const handleSave = async () => {
        if (!currentDraft?.slug || currentDraft.slug.trim().length === 0) {
            toast.error('Please claim a unique URL for your invite before proceeding.');
            return;
        }
        if (currentDraft && slugStatus.available !== false) {
            try {
                await updateInviteAsync({ inviteData: currentDraft, status: 'PUBLISHED' });
            } catch (error: any) {
                const message = error.response?.data?.message || 'Update failed';
                toast.error(message);
                // Rollback local state
                if (data?.inviteData) {
                    setAllData(data.inviteData);
                }
            }
        } else {
            toast.error('Please claim a unique and available URL before proceeding.');
        }
    };

    const saveDraft = () => {
        if (!currentDraft?.slug || currentDraft.slug.trim().length === 0) {
            toast.error('Please claim a unique URL for your invite before proceeding.');
            return;
        }
        // Local saving is handled by zustand automatically
        toast.success("Draft saved locally!");
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this draft?")) {
            deleteDraft(inviteId, {
                onSuccess: () => {
                    router.push('/dashboard');
                }
            });
        }
    };

    // Move the handleAddToBag below or keep here.
    const handleAddToBag = () => {
        const { couple, celebrations, slug } = currentDraft || {};

        if (!couple?.bride?.name?.trim() || !couple?.groom?.name?.trim()) {
            toast.error("Please enter both the Bride and Groom's names before proceeding.");
            return;
        }

        if (!celebrations || celebrations.length === 0 || !celebrations[0].date) {
            toast.error("Please add at least one celebration with a valid date.");
            return;
        }

        if (!slug?.trim()) {
            toast.error("Please claim your custom URL slug before proceeding.");
            return;
        }

        if (slugStatus.available === false) {
            toast.error('Please claim an available URL before proceeding.');
            return;
        }

        if (digitalProduct) {
            addItem({
                id: digitalProduct.id,
                title: digitalProduct.title,
                price: digitalProduct.price,
                type: 'DIGITAL',
                imageUrl: digitalProduct.imageUrl || "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=800",
                inviteData: currentDraft,
                draftId: inviteId
            } as any);
            toast.success('Invite added to your atelier bag.');
            router.push('/checkout');
        }
    };

    const addToBag = handleAddToBag;

    // Debounced Slug Availability Check
    useEffect(() => {
        const currentSlug = currentDraft?.slug;
        if (!currentSlug || currentSlug.trim().length === 0) {
            setSlugStatus({ loading: false, available: null, suggestions: [] });
            return;
        }

        // Skip check if slug hasn't changed from original data
        if (data?.slug && data.slug === currentSlug) {
            setSlugStatus({ loading: false, available: true, suggestions: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setSlugStatus(prev => ({ ...prev, loading: true }));
            try {
                const res = await apiClient.get(`/digital-invites/check-slug/${encodeURIComponent(currentSlug)}`);
                setSlugStatus({
                    loading: false,
                    available: res.data.available,
                    suggestions: res.data.suggestions || []
                });
            } catch (error) {
                console.error("Slug check failed", error);
                setSlugStatus({ loading: false, available: null, suggestions: [] });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [currentDraft?.slug, data?.slug]);

    const updateSlug = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (currentDraft) setAllData({ ...currentDraft, slug: sanitized });
    };

    const updateCoupleField = (field: string, value: string) => {
        if (currentDraft) setAllData({ ...currentDraft, couple: { ...currentDraft.couple, [field]: value } });
    };

    const updatePersonName = (person: 'bride' | 'groom', value: string) => {
        if (currentDraft) setAllData({
            ...currentDraft,
            couple: { ...currentDraft.couple, [person]: { ...currentDraft.couple[person], name: value } }
        });
    };

    const updateParentInfo = (person: 'bride' | 'groom', parentType: 'mother' | 'father', value: string) => {
        if (currentDraft) setAllData({
            ...currentDraft,
            couple: {
                ...currentDraft.couple,
                [person]: {
                    ...currentDraft.couple[person],
                    parents: {
                        ...currentDraft.couple[person].parents,
                        [parentType]: value
                    }
                }
            }
        });
    };

    const updateParentOrder = (person: 'bride' | 'groom', value: 'MOTHER_FIRST' | 'FATHER_FIRST') => {
        if (currentDraft) setAllData({
            ...currentDraft,
            couple: {
                ...currentDraft.couple,
                [person]: {
                    ...currentDraft.couple[person],
                    parents: {
                        ...currentDraft.couple[person].parents,
                        order: value
                    }
                }
            }
        });
    };

    const updateMessage = (field: string, value: string) => {
        if (currentDraft) setAllData({
            ...currentDraft,
            messages: { ...currentDraft.messages, [field]: value }
        });
    };

    const updateWedding = (field: string, value: string) => {
        if (currentDraft) setAllData({ ...currentDraft, wedding: { ...currentDraft.wedding, [field]: value } });
    };

    const updateEvent = (id: string, field: string, value: string | boolean) => {
        if (currentDraft) setAllData({
            ...currentDraft,
            celebrations: currentDraft.celebrations.map(ev => ev.id === id ? { ...ev, [field]: value } : ev)
        });
    };

    const updateContact = (field: string, value: string) => {
        if (currentDraft) {
            setAllData({
                ...currentDraft,
                contact: { ...currentDraft.contact, [field]: value }
            });
        }
    };

    const updateMusic = (field: 'url' | 'autoplay', value: string | boolean) => {
        if (currentDraft) {
            setAllData({
                ...currentDraft,
                music: { ...currentDraft.music, [field]: value }
            });
        }
    };

    const addEvent = () => {
        if (currentDraft) setAllData({
            ...currentDraft,
            celebrations: [
                ...currentDraft.celebrations,
                { id: Date.now().toString(), name: "New Event", date: "", time: "", venue: "", googleMapsUrl: "", dressCode: "", showLocation: false, highlight: false }
            ]
        });
    };

    const removeCelebration = (index: number) => {
        if (currentDraft && currentDraft.celebrations.length > 1) {
            const newCelebrations = [...currentDraft.celebrations];
            newCelebrations.splice(index, 1);
            setAllData({ ...currentDraft, celebrations: newCelebrations });
        }
    };

    const isAwsUrl = (url: string) => url.includes('amazonaws.com');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        const file = e.target.files?.[0];
        if (!file || !currentDraft) return;

        const toastId = toast.loading(`Uploading ${type}...`);
        try {
            // Delete old file if it's an AWS URL
            const oldUrl = type === 'image' ? currentDraft.couple?.image : currentDraft.music?.url;
            if (oldUrl && isAwsUrl(oldUrl)) {
                await deleteFile(oldUrl).catch(console.error); // Best effort
            }

            const newUrl = await uploadFile({ file, folder: 'invites' });

            if (type === 'image') {
                setAllData({
                    ...currentDraft,
                    couple: { ...currentDraft.couple, image: newUrl }
                });
            } else {
                setAllData({
                    ...currentDraft,
                    music: { ...currentDraft.music, url: newUrl }
                });
            }
            toast.success(`Successfully uploaded ${type}!`, { id: toastId });
        } catch {
            toast.error(`Failed to upload ${type}.`, { id: toastId });
        }
    };

    const handleRemoveFile = async (type: 'image' | 'audio') => {
        if (!currentDraft) return;

        const oldUrl = type === 'image' ? currentDraft.couple?.image : currentDraft.music?.url;
        if (oldUrl && isAwsUrl(oldUrl)) {
            await deleteFile(oldUrl).catch(console.error);
        }

        if (type === 'image') {
            const placeholder = "";
            setAllData({
                ...currentDraft,
                couple: { ...currentDraft.couple, image: placeholder }
            });
            toast.success("Image removed.");
        } else {
            const placeholder = ""; // Assuming frontend audio player handles empty url properly or uses a fallback
            setAllData({
                ...currentDraft,
                music: { ...currentDraft.music, url: placeholder }
            });
            toast.success("Music removed.");
        }
    };

    useEffect(() => {
        if (isError) {
            toast.error("This invitation draft is unavailable or you do not have permission to view it.");
            router.push('/dashboard');
        }
    }, [isError, router]);

    // Luxury Loading State
    if (isLoading && inviteId !== 'new') {
        return (
            <div className="bg-primary min-h-screen flex flex-col items-center justify-center font-playfair tracking-wide">
                <Loader2 size={32} className="animate-spin text-secondary mb-6" strokeWidth={1} />
                <h2 className="text-2xl text-primary loading-text">
                    Retrieving your atelier draft...
                </h2>
            </div>
        );
    }

    if (isError) {
        return null;
    }

    return (
        <div className="h-[calc(100vh-64px)] w-full flex flex-col md:flex-row overflow-hidden bg-white text-black">
            {/* Real Sidebar Controller */}
            <div className={`${activeMobileView === 'editor' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 md:min-w-[350px] md:max-w-[450px] flex-col h-full bg-white border-r border-gray-200 pb-16 md:pb-0`}>
                <div className="p-6 shrink-0">
                    <h3 className="font-playfair text-2xl text-[#1A1A1A] tracking-wide">Editor</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                    {/* Section 0: Claim URL */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'url' ? null : 'url')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><LinkIcon size={16} strokeWidth={1} className="text-[#5A5A5A]" /> Claim Your URL</span>
                            <span className="text-lg font-light leading-none">{openSection === 'url' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'url' ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E4DF]">
                                <p className="text-[10px] text-[#5A5A5A] uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>Your Custom Link</p>
                                <div className="flex items-center bg-[#F2F1EC] rounded-sm px-4 py-3 border border-[#E5E4DF] focus-within:border-[#1A1A1A] transition-colors overflow-hidden">
                                    <span className="text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>takshstore.com/invites/</span>
                                    <input
                                        type="text"
                                        value={currentDraft?.slug || ''}
                                        onChange={(e) => updateSlug(e.target.value)}
                                        placeholder="karan-weds-priya"
                                        className="w-full bg-transparent text-sm text-[#1A1A1A] font-medium outline-none ml-1 placeholder:font-normal"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <div className="shrink-0 ml-2">
                                        {slugStatus.loading && <Loader2 size={16} className="text-[#5A5A5A] animate-spin" />}
                                        {!slugStatus.loading && slugStatus.available === true && <CheckCircle size={16} className="text-green-600" />}
                                        {!slugStatus.loading && slugStatus.available === false && <XCircle size={16} className="text-red-500" />}
                                    </div>
                                </div>

                                {!slugStatus.loading && slugStatus.available === true && (
                                    <p className="text-xs text-green-600 mt-1" style={{ fontFamily: 'var(--font-inter)' }}>This URL is available!</p>
                                )}

                                {!slugStatus.loading && slugStatus.available === false && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-xs text-red-600 mb-2" style={{ fontFamily: 'var(--font-inter)' }}>This URL is taken. Try one of these:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {slugStatus.suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => updateSlug(suggestion)}
                                                    className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isPurchased && (
                                    <p className="text-[10px] text-[#5A5A5A] mt-2 italic" style={{ fontFamily: 'var(--font-inter)' }}>
                                        URL reserved. Link will activate immediately after purchase.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 1: The Couple */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'couple' ? null : 'couple')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><User size={16} strokeWidth={1} className="text-[#5A5A5A]" /> The Couple</span>
                            <span className="text-lg font-light leading-none">{openSection === 'couple' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'couple' ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-6 pt-4 border-t border-[#E5E4DF]">
                                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs text-left" style={{ fontFamily: 'var(--font-inter)' }}>
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <p><strong>Please verify spelling carefully.</strong> To protect license integrity, major name changes and event postponements beyond 90 days are permanently locked after purchase. Only minor typos can be corrected post-checkout.</p>
                                </div>
                                <div className="flex flex-col gap-2 mb-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Primary Display Order</label>
                                    <select
                                        value={currentDraft?.couple?.primaryOrder || 'BRIDE_FIRST'}
                                        onChange={(e) => updateCoupleField('primaryOrder', e.target.value)}
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    >
                                        <option value="BRIDE_FIRST">Bride's Name First</option>
                                        <option value="GROOM_FIRST">Groom's Name First</option>
                                    </select>
                                </div>
                                <input
                                    type="text" value={currentDraft?.couple?.bride?.name || ''} onChange={(e) => updatePersonName('bride', e.target.value)} placeholder="Bride Name"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={currentDraft?.couple?.groom?.name || ''} onChange={(e) => updatePersonName('groom', e.target.value)} placeholder="Groom Name"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={currentDraft?.wedding?.displayDate || ''} onChange={(e) => updateWedding('displayDate', e.target.value)} placeholder="Display Date"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={currentDraft?.couple?.hashtag || ''} onChange={(e) => updateCoupleField('hashtag', e.target.value)} placeholder="Wedding Hashtag"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />

                                <div className="mt-4 flex flex-col gap-2">
                                    {isPurchased ? (
                                        <>
                                            <div className="border border-dashed border-[#E5E4DF] p-4 flex items-center justify-center hover:bg-[#F2F1EC] transition-colors cursor-pointer text-center relative pointer-events-auto">
                                                {isUploading ? (
                                                    <span className="text-xs uppercase tracking-widest text-[#5A5A5A] flex items-center justify-center pointer-events-none" style={{ fontFamily: 'var(--font-inter)' }}>
                                                        <Loader2 size={14} className="animate-spin mr-2" />
                                                        UPLOADING...
                                                    </span>
                                                ) : (
                                                    <label className="cursor-pointer flex items-center text-xs uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors w-full justify-center" style={{ fontFamily: 'var(--font-inter)' }}>
                                                        <Upload size={14} strokeWidth={1} className="mr-2" />
                                                        {currentDraft?.couple?.image && currentDraft.couple.image !== "" && currentDraft.couple.image !== "/assets/images/couple.png" && currentDraft.couple.image !== "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=800" ? 'CHANGE COUPLE PHOTO' : 'UPLOAD COUPLE PHOTO'}
                                                        <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'image')} />
                                                        <div className="absolute inset-0 w-full h-full opactiy-0 cursor-pointer pointer-events-auto z-10"></div>
                                                    </label>
                                                )}
                                            </div>
                                            {currentDraft?.couple?.image && currentDraft.couple.image !== "" && currentDraft.couple.image !== "/assets/images/couple.png" && currentDraft.couple.image !== "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=800" && (
                                                <button onClick={() => handleRemoveFile('image')} disabled={isUploading} className="text-[10px] text-red-500 hover:text-red-700 tracking-widest uppercase transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
                                                    Remove Custom Photo
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <LockedMediaUpload
                                            title="Custom Photo Upload"
                                            description="Personalize your invite with your own photo. This feature unlocks immediately after you complete your purchase."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Parents */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'parents' ? null : 'parents')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><Users size={16} strokeWidth={1} className="text-[#5A5A5A]" /> The Hosts (Family)</span>
                            <span className="text-lg font-light leading-none">{openSection === 'parents' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'parents' ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-8 pt-4 border-t border-[#E5E4DF]">

                                <div className="flex flex-col gap-4">
                                    <h4 className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Bride's Family</h4>
                                    <div className="flex flex-col gap-2 mb-2">
                                        <select
                                            value={currentDraft?.couple?.bride?.parents?.order || 'MOTHER_FIRST'}
                                            onChange={(e) => updateParentOrder('bride', e.target.value as any)}
                                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        >
                                            <option value="MOTHER_FIRST">Mother's Name First</option>
                                            <option value="FATHER_FIRST">Father's Name First</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text" value={currentDraft?.couple?.bride?.parents?.mother || ''} onChange={(e) => updateParentInfo('bride', 'mother', e.target.value)} placeholder="Mother's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <input
                                        type="text" value={currentDraft?.couple?.bride?.parents?.father || ''} onChange={(e) => updateParentInfo('bride', 'father', e.target.value)} placeholder="Father's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h4 className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Groom's Family</h4>
                                    <div className="flex flex-col gap-2 mb-2">
                                        <select
                                            value={currentDraft?.couple?.groom?.parents?.order || 'FATHER_FIRST'}
                                            onChange={(e) => updateParentOrder('groom', e.target.value as any)}
                                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        >
                                            <option value="MOTHER_FIRST">Mother's Name First</option>
                                            <option value="FATHER_FIRST">Father's Name First</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text" value={currentDraft?.couple?.groom?.parents?.mother || ''} onChange={(e) => updateParentInfo('groom', 'mother', e.target.value)} placeholder="Mother's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <input
                                        type="text" value={currentDraft?.couple?.groom?.parents?.father || ''} onChange={(e) => updateParentInfo('groom', 'father', e.target.value)} placeholder="Father's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Section 3: Events */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'events' ? null : 'events')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><CalendarHeart size={16} strokeWidth={1} className="text-[#5A5A5A]" /> Celebrations</span>
                            <span className="text-lg font-light leading-none">{openSection === 'events' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'events' ? 'max-h-[2000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-10 pt-4 border-t border-[#E5E4DF]">
                                {currentDraft?.celebrations?.map((ev, i) => (
                                    <div key={ev.id} className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>{ev.name || `Event ${i + 1}`}</h4>
                                            {currentDraft.celebrations.length > 1 && (
                                                <button onClick={() => removeCelebration(i)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text" value={ev.name || ''} onChange={(e) => updateEvent(ev.id, 'name', e.target.value)} placeholder="Event Name"
                                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors font-semibold"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarHeart size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="date" value={ev.date || ''} onChange={(e) => updateEvent(ev.id, 'date', e.target.value)} placeholder="Date"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="time" value={ev.time || ''} onChange={(e) => updateEvent(ev.id, 'time', e.target.value)} placeholder="Time"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                            <input
                                                type="text" value={ev.venue || ''} onChange={(e) => updateEvent(ev.id, 'venue', e.target.value)} placeholder="Venue"
                                                className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                style={{ fontFamily: 'var(--font-inter)' }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                id={`showLocation-${ev.id}`}
                                                checked={ev.showLocation || false}
                                                onChange={(e) => updateEvent(ev.id, 'showLocation', e.target.checked)}
                                                className="w-4 h-4 text-[#C5B39A] bg-transparent border-[#E5E4DF] focus:ring-[#C5B39A] focus:ring-1"
                                            />
                                            <label htmlFor={`showLocation-${ev.id}`} className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                                Show Map Location for this event
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                id={`highlight-${ev.id}`}
                                                checked={ev.highlight || false}
                                                onChange={(e) => updateEvent(ev.id, 'highlight', e.target.checked)}
                                                className="w-4 h-4 text-[#C5B39A] bg-transparent border-[#E5E4DF] focus:ring-[#C5B39A] focus:ring-1"
                                            />
                                            <label htmlFor={`highlight-${ev.id}`} className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                                Highlight this event
                                            </label>
                                        </div>
                                        {ev.showLocation && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <LinkIcon size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="text" value={ev.googleMapsUrl || ''} onChange={(e) => updateEvent(ev.id, 'googleMapsUrl', e.target.value)} placeholder="Google Maps URL"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Tag size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                            <input
                                                type="text" value={ev.dressCode || ''} onChange={(e) => updateEvent(ev.id, 'dressCode', e.target.value)} placeholder="Dress Code"
                                                className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                style={{ fontFamily: 'var(--font-inter)' }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addEvent} className="mt-4 flex items-center justify-center w-full py-4 text-[10px] uppercase tracking-widest text-[#5A5A5A] border border-[#E5E4DF] hover:bg-[#F2F1EC] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
                                    <Plus size={12} strokeWidth={1} className="mr-2" /> ADD ANOTHER EVENT
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Section 4: Contact & RSVP */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'contact' ? null : 'contact')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><Users size={16} strokeWidth={1} className="text-[#5A5A5A]" /> Contact & RSVP</span>
                            <span className="text-lg font-light leading-none">{openSection === 'contact' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'contact' ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-6 pt-4 border-t border-[#E5E4DF]">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>WhatsApp RSVP Number</label>
                                    <input
                                        type="text" value={currentDraft?.contact?.whatsapp || ''} onChange={(e) => updateContact('whatsapp', e.target.value)} placeholder="e.g. 9852973546"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Instagram Profile URL</label>
                                    <input
                                        type="text" value={currentDraft?.contact?.instagram || ''} onChange={(e) => updateContact('instagram', e.target.value)} placeholder="https://instagram.com/myusername"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Music */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'music' ? null : 'music')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><Upload size={16} strokeWidth={1} className="text-[#5A5A5A]" /> Background Music</span>
                            <span className="text-lg font-light leading-none">{openSection === 'music' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'music' ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E4DF]">

                                {isPurchased ? (
                                    <>
                                        <div className="border border-dashed border-[#E5E4DF] p-4 flex items-center justify-center hover:bg-[#F2F1EC] transition-colors cursor-pointer relative pointer-events-auto">
                                            {isUploading ? (
                                                <span className="text-xs uppercase tracking-widest text-[#5A5A5A] flex items-center justify-center pointer-events-none" style={{ fontFamily: 'var(--font-inter)' }}>
                                                    <Loader2 size={14} className="animate-spin mr-2" />
                                                    UPLOADING...
                                                </span>
                                            ) : (
                                                <label className="cursor-pointer flex items-center text-xs uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors w-full justify-center" style={{ fontFamily: 'var(--font-inter)' }}>
                                                    <Upload size={14} strokeWidth={1} className="mr-2" />
                                                    {currentDraft?.music?.url && currentDraft?.music?.url !== "" ? 'CHANGE MUSIC' : 'UPLOAD MUSIC (.MP3)'}
                                                    <input type="file" accept="audio/mpeg" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'audio')} />
                                                    <div className="absolute inset-0 w-full h-full opactiy-0 cursor-pointer pointer-events-auto z-10"></div>
                                                </label>
                                            )}
                                        </div>
                                        {currentDraft?.music?.url && currentDraft.music.url !== "" && (
                                            <button onClick={() => handleRemoveFile('audio')} disabled={isUploading} className="text-[10px] text-red-500 hover:text-red-700 tracking-widest uppercase transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
                                                Remove Custom Music
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <LockedMediaUpload
                                        title="Custom Background Music"
                                        description="Set the perfect mood with your own MP3. This feature unlocks immediately after checkout."
                                    />
                                )}

                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E5E4DF]">
                                    <input
                                        type="checkbox"
                                        id="autoplay-music"
                                        checked={currentDraft?.music?.autoplay || false}
                                        onChange={(e) => updateMusic('autoplay', e.target.checked)}
                                        className="w-4 h-4 text-[#C5B39A] bg-transparent border-[#E5E4DF] focus:ring-[#C5B39A] focus:ring-1"
                                    />
                                    <label htmlFor="autoplay-music" className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                        Autoplay Music on Live Invite
                                    </label>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Section 6: Messages & SEO */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white shrink-0">
                        <button
                            onClick={() => setOpenSection(openSection === 'messages' ? null : 'messages')}
                            className="w-full flex items-center justify-between p-6 text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="flex items-center gap-3"><FileText size={16} strokeWidth={1} className="text-[#5A5A5A]" /> Messages & SEO</span>
                            <span className="text-lg font-light leading-none">{openSection === 'messages' ? '−' : '+'}</span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${openSection === 'messages' ? 'max-h-[1200px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-6 pt-4 border-t border-[#E5E4DF]">

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Invite Text</label>
                                    <textarea
                                        value={currentDraft?.messages?.inviteText || ''}
                                        onChange={(e) => updateMessage('inviteText', e.target.value.substring(0, 300))}
                                        placeholder="With joyful hearts, we invite you..."
                                        className="w-full bg-[#f8f8f8] border border-[#E5E4DF] p-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-sm min-h-[100px] resize-none"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <span className="text-xs text-gray-500 text-right">{currentDraft?.messages?.inviteText?.length || 0}/300</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Social Share Text (SEO)</label>
                                    <textarea
                                        value={currentDraft?.messages?.socialShareText || ''}
                                        onChange={(e) => updateMessage('socialShareText', e.target.value.substring(0, 160))}
                                        placeholder="With immense joy and heartfelt happiness..."
                                        maxLength={160}
                                        className="w-full bg-[#f8f8f8] border border-[#E5E4DF] p-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-sm min-h-[80px] resize-none"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <span className="text-xs text-gray-500 text-right">{currentDraft?.messages?.socialShareText?.length || 0}/160</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>



                {/* Sticky Action Footer */}
                {isPurchased ? (
                    <div className="flex gap-4 p-4 border-t border-[#E5E4DF] bg-white shadow-md mt-auto shrink-0 z-10 w-full">
                        <button
                            onClick={handleSave}
                            disabled={!currentDraft?.slug || isPending}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#1A1A1A] text-white border border-transparent hover:bg-black transition-colors flex-1 ${(!currentDraft?.slug || isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                            Publish Changes
                        </button>
                        <a
                            href={`/invites/${data?.slug || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#F2F1EC] text-[#1A1A1A] border border-transparent hover:border-gray-300 transition-colors flex-1"
                        >
                            <Globe size={16} /> View Live Invite
                        </a>
                    </div>
                ) : (
                    <div className="flex gap-2 p-4 border-t border-[#E5E4DF] bg-white shadow-md mt-auto shrink-0 z-10 w-full">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-red-500 p-2 hover:bg-red-50 transition-colors border border-transparent rounded-sm flex items-center justify-center"
                            title="Delete Draft"
                        >
                            {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} strokeWidth={1} />}
                        </button>
                        <button
                            onClick={saveDraft}
                            disabled={!currentDraft?.slug}
                            className={`flex justify-center items-center gap-2 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors flex-1 ${!currentDraft?.slug ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={16} /> Save Draft
                        </button>
                        <button
                            onClick={addToBag}
                            disabled={!currentDraft?.slug || slugStatus.available === false}
                            className={`flex justify-center items-center gap-2 px-4 py-2 text-sm bg-[#1A1A1A] text-white border border-transparent hover:bg-black transition-colors flex-1 ${(!currentDraft?.slug || slugStatus.available === false) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ShoppingBag size={16} /> Add to Bag
                        </button>
                    </div>
                )}
            </div>

            <div className={`${activeMobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 bg-gray-50 items-center justify-center p-4 md:p-8 h-full overflow-hidden pb-16 md:pb-0`}>
                <div className="w-[430px] h-[932px] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden bg-white shrink-0 transform md:scale-[0.75] xl:scale-[0.85] 2xl:scale-[0.9] origin-center transition-transform">
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-0"
                        title="Live Preview"
                        onLoad={() => setIframeLoaded(true)}
                    />
                </div>
            </div>

            {/* Mobile Toggle Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex z-50">
                <button
                    onClick={() => setActiveMobileView('editor')}
                    className={`flex-1 flex items-center justify-center font-medium text-sm transition-colors ${activeMobileView === 'editor' ? 'text-[#1A1A1A] border-t-2 border-[#1A1A1A] bg-gray-50' : 'text-[#5A5A5A]'}`}
                >
                    Edit Details
                </button>
                <button
                    onClick={() => setActiveMobileView('preview')}
                    className={`flex-1 flex items-center justify-center font-medium text-sm transition-colors ${activeMobileView === 'preview' ? 'text-[#1A1A1A] border-t-2 border-[#1A1A1A] bg-gray-50' : 'text-[#5A5A5A]'}`}
                >
                    Live Preview
                </button>
            </div>
        </div>
    );
}
