"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDigitalInvite, useUpdateInvite, useDeleteDraft } from "../../hooks/useDigitalInvite";
import { useInviteStore } from "../../store/useInviteStore";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useProducts } from "../../hooks/useProducts";
import { Loader2, ShoppingBag, ExternalLink, User, CalendarHeart, MapPin, Clock, Users, Tag, Upload, Plus, Link as LinkIcon, CheckCircle, XCircle, Save, Globe, UploadCloud } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getTemplate } from "../templates/TemplateRegistry";
import { toast } from "sonner";

interface CustomizerEditorProps {
    inviteId: string;
}

export default function CustomizerEditor({ inviteId }: CustomizerEditorProps) {
    // 1. Fetch data from backend
    const { data, isLoading, isError } = useDigitalInvite(inviteId);
    const { mutate: updateInvite, isPending } = useUpdateInvite(inviteId);
    const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft();
    const router = useRouter();

    // 2. Local State / Zustand Hydration
    const setAllData = useInviteStore((state) => state.setAllData);
    const currentDraft = useInviteStore((state) => state.inviteData);
    const headerRef = useRef<HTMLDivElement>(null);
    const saveBtnRef = useRef<HTMLButtonElement>(null);
    const [openSection, setOpenSection] = useState<'url' | 'couple' | 'parents' | 'events' | 'contact' | null>('url');
    const [slugStatus, setSlugStatus] = useState<{ loading: boolean; available: boolean | null; suggestions: string[] }>({ loading: false, available: null, suggestions: [] });

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

    const handleSave = () => {
        if (!currentDraft?.slug || currentDraft.slug.trim().length === 0) {
            toast.error('Please claim a unique URL for your invite before proceeding.');
            return;
        }
        if (currentDraft && slugStatus.available !== false) {
            updateInvite(currentDraft);
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
        if (!currentDraft?.slug || currentDraft.slug.trim().length === 0) {
            toast.error('Please claim a unique URL for your invite before proceeding.');
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

    const addEvent = () => {
        if (currentDraft) setAllData({
            ...currentDraft,
            celebrations: [
                ...currentDraft.celebrations,
                { id: Date.now().toString(), name: "New Event", date: "", time: "", venue: "", googleMapsUrl: "", dressCode: "", showLocation: false }
            ]
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentDraft) {
            const url = URL.createObjectURL(file);
            setAllData({
                ...currentDraft,
                couple: { ...currentDraft.couple, image: url }
            });
        }
    };

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
        return (
            <div className="bg-primary min-h-screen flex flex-col items-center justify-center font-playfair tracking-wide">
                <h2 className="text-2xl text-red-800">Error retrieving draft.</h2>
                <p className="font-inter text-sm mt-4 text-secondary">
                    Please return to your dashboard and try again.
                </p>
            </div>
        );
    }

    // Determine Dynamic Template
    const templateId = data?.orderItem?.product?.templateId || 'riyawedsmoon'; // Or another property if it's there
    const ActiveTemplate = getTemplate(templateId);

    return (
        <div className="flex w-full overflow-hidden bg-white text-black" style={{ height: 'calc(100vh - 64px)' }}>
            {/* Real Sidebar Controller */}
            <div className="w-1/3 min-w-[350px] max-w-[450px] border-r border-gray-200 flex flex-col bg-[#FBFBF9]">
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
                                        placeholder="riya-weds-moon"
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

                                <div className="mt-4 border border-dashed border-[#E5E4DF] p-4 flex items-center justify-center hover:bg-[#F2F1EC] transition-colors cursor-pointer">
                                    <label className="cursor-pointer flex items-center text-xs uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors w-full justify-center" style={{ fontFamily: 'var(--font-inter)' }}>
                                        <Upload size={14} strokeWidth={1} className="mr-2" />
                                        {currentDraft?.couple?.image ? 'CHANGE COUPLE PHOTO' : 'UPLOAD COUPLE PHOTO'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
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
                                                    type="text" value={ev.date || ''} onChange={(e) => updateEvent(ev.id, 'date', e.target.value)} placeholder="Date"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="text" value={ev.time || ''} onChange={(e) => updateEvent(ev.id, 'time', e.target.value)} placeholder="Time"
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

            {/* Canvas Area with Live Preview */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden p-4">
                {/* Outer container handles the CSS scaling so it fits on smaller laptop screens */}
                <div className="relative w-full max-w-[430px] h-[932px] shrink-0 rounded-[2.5rem] shadow-2xl border-8 border-gray-900 overflow-hidden bg-white transform origin-center scale-[0.8] xl:scale-100 transition-transform">
                    {/* Inner container handles the independent scrolling */}
                    <div className="w-full h-full overflow-y-auto scrollbar-hide">
                        <ActiveTemplate data={currentDraft} isPreviewMode={true} />
                    </div>
                </div>
            </div>
        </div >
    );
}
