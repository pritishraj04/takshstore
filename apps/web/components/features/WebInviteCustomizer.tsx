"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCollectionStore } from "../../store/useCollectionStore";
import { Product } from "../../types";
import { User, CalendarHeart, ShoppingBag, MapPin, Clock, Users, Tag, Upload, Plus, Link as LinkIcon, ArrowLeft, X } from "lucide-react";

interface WebInviteCustomizerProps {
    product: Product;
}

export default function WebInviteCustomizer({ product }: WebInviteCustomizerProps) {
    const { addItem, setIsOpen } = useCollectionStore();

    // JSON State Management
    const [inviteData, setInviteData] = useState({
        couple: {
            bride: {
                name: "Riya",
                parents: { mother: "Mrs. Sharma", father: "Mr. Sharma" }
            },
            groom: {
                name: "Moon",
                parents: { mother: "Mrs. Singh", father: "Mr. Singh" }
            },
            hashtag: "#RiyaToTheMoon",
            image: ""
        },
        wedding: {
            displayDate: "October 14, 2026"
        },
        celebrations: [
            { id: "haldi", name: "Haldi", date: "Oct 13", time: "10:00 AM", venue: "Villa Balbiano Gardens", googleMapsUrl: "", dressCode: "Yellow & White" },
            { id: "mehendi", name: "Mehendi", date: "Oct 13", time: "4:00 PM", venue: "The Grand Terrace", googleMapsUrl: "", dressCode: "Green & Vibrant" },
            { id: "wedding", name: "Wedding", date: "Oct 14", time: "5:00 PM", venue: "Villa Balbiano", googleMapsUrl: "", dressCode: "Traditional/Formal" }
        ],
        messages: {
            inviteText: "Together with our families, we joyfully invite you to celebrate our wedding.",
            whatsappContact: "+12345678900",
            youtubeLink: "",
            optionalNote: ""
        }
    });

    const [openSection, setOpenSection] = useState<'couple' | 'parents' | 'events' | null>('couple');
    const [developerNotes, setDeveloperNotes] = useState("");
    const [isTncOpen, setIsTncOpen] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [isDraftSaved, setIsDraftSaved] = useState(false);

    const router = useRouter();

    const validateForm = () => {
        setValidationError("");
        if (!inviteData.couple.bride.name.trim() || !inviteData.couple.groom.name.trim()) {
            return false;
        }
        const hasValidEvent = inviteData.celebrations.some(ev => ev.venue.trim() || ev.date.trim());
        if (!hasValidEvent) {
            return false;
        }
        return true;
    };

    const handleSaveAndAdd = () => {
        if (!validateForm()) {
            setValidationError("Please complete required couple and event details.");
            return;
        }
        setValidationError("");
        addItem({ ...product, type: "DIGITAL" });
        setIsOpen(true);
    };

    const handleSaveDraft = () => {
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 3000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setInviteData(prev => ({
                ...prev,
                couple: { ...prev.couple, image: url }
            }));
        }
    };

    const updateCoupleField = (field: string, value: string) => {
        setInviteData(prev => ({ ...prev, couple: { ...prev.couple, [field]: value } }));
    };

    const updatePersonName = (person: 'bride' | 'groom', value: string) => {
        setInviteData(prev => ({
            ...prev,
            couple: { ...prev.couple, [person]: { ...prev.couple[person], name: value } }
        }));
    };

    const updateParentInfo = (person: 'bride' | 'groom', parentType: 'mother' | 'father', value: string) => {
        setInviteData(prev => ({
            ...prev,
            couple: {
                ...prev.couple,
                [person]: {
                    ...prev.couple[person],
                    parents: {
                        ...prev.couple[person].parents,
                        [parentType]: value
                    }
                }
            }
        }));
    };

    const updateWedding = (field: string, value: string) => {
        setInviteData(prev => ({ ...prev, wedding: { ...prev.wedding, [field]: value } }));
    };

    const updateEvent = (id: string, field: string, value: string) => {
        setInviteData(prev => ({
            ...prev,
            celebrations: prev.celebrations.map(ev => ev.id === id ? { ...ev, [field]: value } : ev)
        }));
    };

    const addEvent = () => {
        setInviteData(prev => ({
            ...prev,
            celebrations: [
                ...prev.celebrations,
                { id: Date.now().toString(), name: "New Event", date: "", time: "", venue: "", googleMapsUrl: "", dressCode: "" }
            ]
        }));
    };

    return (
        <div className="w-full min-h-screen bg-[#FBFBF9] grid grid-cols-1 lg:grid-cols-12 overflow-hidden text-[#1A1A1A]">

            {/* Left Column: Live Mobile Preview */}
            <div className="col-span-1 lg:col-span-7 bg-[#F2F1EC] flex items-center justify-center p-8 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <Image src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=1200" alt="Texture" fill className="object-cover" />
                </div>

                <div className="w-[375px] h-[812px] bg-[#FBFBF9] rounded-[3rem] shadow-2xl border-8 border-[#1A1A1A] overflow-hidden relative flex flex-col z-10">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#FBFBF9]">

                        {/* Hero Section */}
                        <section className="relative w-full min-h-[812px] flex flex-col items-center justify-center text-center p-8">
                            <div className="absolute inset-0 z-0">
                                <Image src={inviteData.couple.image || "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=800"} alt="Hero Background" fill className="object-cover opacity-60 mix-blend-multiply" />
                                <div className="absolute inset-0 bg-linear-to-b from-[#F2F1EC]/40 to-[#F2F1EC] z-10" />
                            </div>

                            <div className="relative z-20 flex flex-col items-center w-full">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>{inviteData.couple.hashtag}</p>

                                <h1 className="text-6xl text-[#1A1A1A] tracking-tight leading-none mb-4 wrap-break-word w-full px-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {inviteData.couple.bride.name}
                                </h1>
                                <span className="text-2xl italic text-[#C5B39A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>&</span>
                                <h1 className="text-6xl text-[#1A1A1A] tracking-tight leading-none mb-12 wrap-break-word w-full px-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {inviteData.couple.groom.name}
                                </h1>

                                <div className="w-px h-12 bg-[#1A1A1A] mb-8" />

                                <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {inviteData.wedding.displayDate}
                                </p>

                                <p className="text-xs text-[#5A5A5A] mt-16 max-w-[80%] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                    Hosted by<br />
                                    <span className="italic text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>{inviteData.couple.bride.parents.mother} & {inviteData.couple.bride.parents.father}</span><br />
                                    <span style={{ fontFamily: 'var(--font-playfair)' }}>and</span><br />
                                    <span className="italic text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>{inviteData.couple.groom.parents.mother} & {inviteData.couple.groom.parents.father}</span>
                                </p>
                            </div>
                        </section>

                        {/* Message Section */}
                        <section className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-20 px-10 flex flex-col items-center text-center">
                            <p className="text-sm leading-loose tracking-wide" style={{ fontFamily: 'var(--font-inter)' }}>
                                "{inviteData.messages.inviteText}"
                            </p>
                            {inviteData.messages.optionalNote && (
                                <p className="text-[10px] uppercase tracking-widest text-[#C5B39A] mt-8 opacity-80" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {inviteData.messages.optionalNote}
                                </p>
                            )}
                        </section>

                        {/* Events Section */}
                        <section className="w-full bg-[#FBFBF9] py-20 px-8 flex flex-col items-center text-center">
                            <h2 className="text-3xl text-[#1A1A1A] mb-16" style={{ fontFamily: 'var(--font-playfair)' }}>Celebrations</h2>

                            <div className="flex flex-col gap-16 w-full">
                                {inviteData.celebrations.map((ev, index) => (
                                    <div key={ev.id} className="flex flex-col items-center relative">
                                        {index !== 0 && <div className="absolute -top-10 w-px h-6 bg-[#E5E4DF]" />}
                                        <h3 className="text-xl text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>{ev.name}</h3>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#5A5A5A] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                                            {ev.date} &bull; {ev.time}
                                        </p>
                                        <p className="text-sm italic text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>{ev.venue}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-[#5A5A5A] uppercase tracking-widest px-4 py-2 bg-[#F2F1EC] rounded-full" style={{ fontFamily: 'var(--font-inter)' }}>
                                            <Tag size={10} strokeWidth={1} /> {ev.dressCode}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            {/* Right Column: The Control Panel */}
            <div className="col-span-1 lg:col-span-5 flex flex-col h-full border-l border-[#E5E4DF] bg-[#FBFBF9] relative">

                <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-24 scrollbar-hide">
                    <h1 className="text-3xl text-[#1A1A1A] tracking-tight mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Configure Digital Experience
                    </h1>

                    {/* Section 1: The Couple */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white">
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
                                    type="text" value={inviteData.couple.bride.name} onChange={(e) => updatePersonName('bride', e.target.value)} placeholder="Bride Name"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={inviteData.couple.groom.name} onChange={(e) => updatePersonName('groom', e.target.value)} placeholder="Groom Name"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={inviteData.wedding.displayDate} onChange={(e) => updateWedding('displayDate', e.target.value)} placeholder="Display Date"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />
                                <input
                                    type="text" value={inviteData.couple.hashtag} onChange={(e) => updateCoupleField('hashtag', e.target.value)} placeholder="Wedding Hashtag"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                />

                                <div className="mt-4 border border-dashed border-[#E5E4DF] p-4 flex items-center justify-center hover:bg-[#F2F1EC] transition-colors cursor-pointer">
                                    <label className="cursor-pointer flex items-center text-xs uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors w-full justify-center" style={{ fontFamily: 'var(--font-inter)' }}>
                                        <Upload size={14} strokeWidth={1} className="mr-2" />
                                        {inviteData.couple.image ? 'CHANGE COUPLE PHOTO' : 'UPLOAD COUPLE PHOTO'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Parents */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white">
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
                                        type="text" value={inviteData.couple.bride.parents.mother} onChange={(e) => updateParentInfo('bride', 'mother', e.target.value)} placeholder="Mother's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <input
                                        type="text" value={inviteData.couple.bride.parents.father} onChange={(e) => updateParentInfo('bride', 'father', e.target.value)} placeholder="Father's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h4 className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>Groom's Family</h4>
                                    <input
                                        type="text" value={inviteData.couple.groom.parents.mother} onChange={(e) => updateParentInfo('groom', 'mother', e.target.value)} placeholder="Mother's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                    <input
                                        type="text" value={inviteData.couple.groom.parents.father} onChange={(e) => updateParentInfo('groom', 'father', e.target.value)} placeholder="Father's Name"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Section 3: Events */}
                    <div className="mb-6 border border-[#E5E4DF] bg-white">
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
                                {inviteData.celebrations.map((ev, i) => (
                                    <div key={ev.id} className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>{ev.name || `Event ${i + 1}`}</h4>
                                        </div>
                                        <input
                                            type="text" value={ev.name} onChange={(e) => updateEvent(ev.id, 'name', e.target.value)} placeholder="Event Name"
                                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors font-semibold"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarHeart size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="text" value={ev.date} onChange={(e) => updateEvent(ev.id, 'date', e.target.value)} placeholder="Date"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                                <input
                                                    type="text" value={ev.time} onChange={(e) => updateEvent(ev.id, 'time', e.target.value)} placeholder="Time"
                                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                            <input
                                                type="text" value={ev.venue} onChange={(e) => updateEvent(ev.id, 'venue', e.target.value)} placeholder="Venue"
                                                className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                style={{ fontFamily: 'var(--font-inter)' }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LinkIcon size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                            <input
                                                type="text" value={ev.googleMapsUrl} onChange={(e) => updateEvent(ev.id, 'googleMapsUrl', e.target.value)} placeholder="Google Maps URL"
                                                className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                                style={{ fontFamily: 'var(--font-inter)' }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tag size={12} strokeWidth={1} className="text-[#C5B39A]" />
                                            <input
                                                type="text" value={ev.dressCode} onChange={(e) => updateEvent(ev.id, 'dressCode', e.target.value)} placeholder="Dress Code"
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

                    {/* Developer Notes */}
                    <div className="mt-12">
                        <textarea
                            value={developerNotes}
                            onChange={(e) => setDeveloperNotes(e.target.value)}
                            placeholder="Notes for the Developer"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-2 text-sm text-[#1A1A1A] resize-none focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            rows={3}
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                        <p className="text-[10px] text-[#5A5A5A] leading-relaxed mt-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            These are the basic details we need to get your invitation development started. For bespoke customizations, you can contact us directly via call, message, or email.
                        </p>
                    </div>

                </div>

                {/* Action Area */}
                <div className="w-full border-t border-[#E5E4DF] bg-[#FBFBF9] p-8 md:p-12 shrink-0 z-20">
                    <div className="flex justify-between items-center mb-6">
                        <span
                            className="text-xs uppercase tracking-widest text-[#5A5A5A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {product.title}
                        </span>
                        <span
                            className="text-lg text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            ${product.price.toLocaleString()}
                        </span>
                    </div>

                    {validationError && (
                        <p className="text-red-600 text-[10px] uppercase tracking-widest mb-4 text-center" style={{ fontFamily: 'var(--font-inter)' }}>{validationError}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                            onClick={handleSaveDraft}
                            className="w-full bg-transparent border border-[#E5E4DF] text-[#1A1A1A] py-5 text-xs uppercase tracking-widest hover:bg-[#F2F1EC] transition-colors flex items-center justify-center"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {isDraftSaved ? 'DRAFT SAVED' : 'SAVE DRAFT'}
                        </button>
                        <button
                            onClick={handleSaveAndAdd}
                            className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <ShoppingBag size={14} className="mr-2" strokeWidth={1} /> ADD TO BAG
                        </button>
                    </div>

                    <div className="text-center">
                        <button onClick={() => setIsTncOpen(true)} className="text-[10px] uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors underline underline-offset-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            By proceeding, you agree to our Terms & Conditions
                        </button>
                    </div>
                </div>

            </div>

            {/* T&C Modal */}
            {isTncOpen && (
                <div className="fixed inset-0 z-200 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#FBFBF9] p-12 max-w-lg w-full shadow-2xl relative">
                        <button onClick={() => setIsTncOpen(false)} className="absolute top-6 right-6 text-[#1A1A1A] hover:opacity-70 transition-opacity">
                            <X size={16} strokeWidth={1} />
                        </button>
                        <h2 className="text-2xl text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Terms & Conditions</h2>
                        <div className="text-sm text-[#5A5A5A] leading-relaxed space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            <p>
                                By submitting this configuration and proceeding with your digital product purchase, you acknowledge that this acts as the foundational blueprint for your bespoke digital invitation.
                            </p>
                            <p>
                                Revisions are currently limited to two (2) comprehensive rounds post-delivery of the initial interactive staging link. Further structural or aesthetic alterations beyond the scope collected here may incur additional layout fees.
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
