"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Calendar, MapPin, Clock, Heart } from 'lucide-react';

// --- Placeholders ---
const RSVPFormPlaceholder = ({ whatsapp }: { whatsapp?: string }) => (
    <div className="p-12 border border-[#E6C27A]/30 rounded-sm text-center relative overflow-hidden bg-[#530A17]">
        {/* Subtle decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#E6C27A]/60"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#E6C27A]/60"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#E6C27A]/60"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#E6C27A]/60"></div>

        <h3 className="text-3xl font-serif text-white mb-4">Confirm Your Presence</h3>
        <p className="text-sm text-white/80 mb-8 font-light max-w-sm mx-auto">
            We would be absolutely honored to share this beautiful day with you.
        </p>
        <button className="px-10 py-4 bg-[#E6C27A] text-[#6B0D1E] font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-white transition-colors duration-500 rounded-sm">
            RSVP via WhatsApp
        </button>
        {whatsapp && <p className="mt-6 text-[10px] uppercase tracking-widest text-[#E6C27A]/70">Connected to: {whatsapp}</p>}
    </div>
);

const AudioPlayerPlaceholder = () => (
    <div className="fixed bottom-8 right-8 z-40">
        <div className="w-12 h-12 bg-[#6B0D1E] border border-[#E6C27A]/50 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] cursor-pointer hover:scale-105 transition-all duration-300 group">
            <Heart className="w-4 h-4 text-[#E6C27A] group-hover:fill-[#E6C27A] transition-colors" />
        </div>
    </div>
);

// --- Interfaces ---
interface UnfoldingLettermarkProps {
    data: {
        couple: {
            primaryOrder: 'GROOM_FIRST' | 'BRIDE_FIRST';
            groom: { name: string };
            bride: { name: string };
        };
        wedding: {
            displayDate: string;
            heroImage?: string;
        };
        celebrations: Array<{
            name: string;
            date: string;
            time: string;
            venue: string;
        }>;
        contact?: {
            whatsapp?: string;
        };
    };
    isPreviewMode?: boolean;
}

export default function UnfoldingLettermark({ data, isPreviewMode = false }: UnfoldingLettermarkProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const envelopeRef = useRef<HTMLDivElement>(null);
    const flapRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [isOpened, setIsOpened] = useState(false);

    const primaryNames = data.couple.primaryOrder === 'GROOM_FIRST'
        ? { first: data.couple.groom.name, second: data.couple.bride.name }
        : { first: data.couple.bride.name, second: data.couple.groom.name };

    // Get primary event details for the hero section
    const primaryEvent = data.celebrations[0] || {};

    const { contextSafe } = useGSAP({ scope: containerRef });

    // Initial Setup
    useGSAP(() => {
        if (!isPreviewMode) {
            document.body.style.overflow = 'hidden';
        }

        gsap.to(stickerRef.current, {
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.set(cardRef.current, { y: 20, opacity: 0, scale: 0.95 });
    }, [isPreviewMode]);

    // The Reveal Animation
    const handleOpen = contextSafe(() => {
        if (isOpened) return;
        setIsOpened(true);

        const tl = gsap.timeline({
            onComplete: () => {
                if (!isPreviewMode) document.body.style.overflow = 'auto';
            }
        });

        tl.to(stickerRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: "back.in(2)" })
            .to(flapRef.current, { rotationX: -180, duration: 0.8, ease: "power3.inOut" }, "-=0.2")
            .to(cardRef.current, { y: -120, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4")
            .to(cardRef.current, { scale: 2.5, y: -200, opacity: 0, duration: 1.2, ease: "power3.inOut" }, "+=0.3")
            .to(overlayRef.current, { autoAlpha: 0, duration: 1, ease: "power2.inOut" }, "-=0.8")
            .fromTo(contentRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.5, ease: "expo.out" },
                "-=0.6"
            );
    });

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#6B0D1E] text-white overflow-x-hidden selection:bg-[#E6C27A] selection:text-[#6B0D1E]">

            {/* Layer 1: The 3D Envelope Experience (Adapted to Maroon/Gold) */}
            <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300">
                <div className="relative perspective-distant w-full max-w-[min(85vw,400px)] aspect-4/3">

                    <div ref={envelopeRef} className="relative w-full h-full bg-[#530A17] shadow-2xl transform-3d">
                        {/* Background texture applied to envelope */}
                        <img src="/themes/red-engagement/bg-texture.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" alt="" />

                        <div className="absolute inset-0 bg-black/40 overflow-hidden">
                            <div className="absolute top-0 w-full h-12 bg-linear-to-b from-black/60 to-transparent"></div>
                        </div>

                        {/* Internal Card */}
                        <div ref={cardRef} className="absolute inset-x-4 top-4 bottom-4 bg-[#7A1124] shadow-xl p-8 flex flex-col items-center justify-center text-center opacity-0 z-10 border-2 border-[#E6C27A]/40">
                            <span className="text-[8px] uppercase tracking-[0.4em] text-[#E6C27A] mb-3">You are invited</span>
                            <h2 className="text-3xl font-serif text-white leading-none">
                                {primaryNames.first} <span className="font-sans font-light italic text-[#E6C27A] text-xl mx-2">&</span> {primaryNames.second}
                            </h2>
                        </div>

                        <div ref={flapRef} className="absolute top-0 inset-x-0 h-1/2 bg-[#6B0D1E] origin-top z-20 shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-b border-[#E6C27A]/30" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'hidden' }}>
                            <img src="/themes/red-engagement/bg-texture.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" alt="" />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[#530A17] z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] border-t border-[#E6C27A]/20" style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
                            <img src="/themes/red-engagement/bg-texture.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" alt="" />
                        </div>

                        {/* Wax Seal */}
                        <div ref={stickerRef} onClick={handleOpen} className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer drop-shadow-2xl">
                            <div className="w-16 h-16 bg-[#E6C27A] rounded-full flex items-center justify-center border-2 border-[#3A0710] relative overflow-hidden group shadow-lg">
                                <span className="text-[#6B0D1E] font-serif text-2xl tracking-widest ml-1 font-bold">
                                    {primaryNames.first[0]}{primaryNames.second[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="absolute -bottom-20 left-0 w-full text-center text-white/70 text-[9px] uppercase tracking-[0.4em]">Tap to open</p>
                </div>
            </div>

            {/* Layer 2: Main Editorial Invitation */}
            <main ref={contentRef} className="opacity-0 relative z-10 bg-[#6B0D1E]">
                <AudioPlayerPlaceholder />

                {/* --- HERO SECTION (Matched exactly to reference image) --- */}
                <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">

                    {/* Background Texture Placeholder */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <img src="/themes/red-engagement/bg-texture.jpg" className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Background Texture" />
                        {/* Optional dark gradient overlay to ensure text readability */}
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#6B0D1E]/40 to-[#6B0D1E]"></div>
                    </div>

                    {/* ARTIFICATS PLACEHOLDERS (Absolute Positioned) */}
                    {/* Top Jhumars */}
                    <img src="/themes/red-engagement/left-jhumar.png" className="absolute top-0 left-0 w-34 md:w-48 lg:w-64 z-10 opacity-90 scale-x-[-1]" alt="Jhumar Left" />
                    <img src="/themes/red-engagement/left-jhumar.png" className="absolute top-0 right-0 w-34 md:w-48 lg:w-64 z-10 opacity-90" alt="Jhumar Right" />

                    {/* Corner/Side Motifs (Rats) */}
                    <img src="/themes/red-engagement/motif-rat.png" className="absolute top-[45%] left-4 md:left-12 w-12 md:w-20 z-10 opacity-80 scale-x-[-1]" alt="Motif" />
                    <img src="/themes/red-engagement/motif-rat.png" className="absolute top-[45%] right-4 md:right-12 w-12 md:w-20 z-10 opacity-80" alt="Motif" />

                    <img src="/themes/red-engagement/motif-rat.png" className="absolute bottom-12 left-4 md:left-12 w-12 md:w-20 z-10 opacity-80 scale-x-[-1]" alt="Motif" />
                    <img src="/themes/red-engagement/motif-rat.png" className="absolute bottom-12 right-4 md:right-12 w-12 md:w-20 z-10 opacity-80" alt="Motif" />

                    {/* MAIN CONTENT STACK */}
                    <div className="relative z-20 flex flex-col items-center w-full max-w-2xl mx-auto mt-12 md:mt-0">

                        <p className="text-white/90 text-sm md:text-base font-light mb-4">
                            You are cordially invited to:
                        </p>

                        {/* Lord Ganesha Placeholder */}
                        <img src="/themes/red-engagement/lord-ganesha.png" className="w-32 md:w-48 mb-8 drop-shadow-xl" alt="Lord Ganesha" />

                        {/* Event Name */}
                        <h2 className="text-[#E6C27A] font-serif text-3xl md:text-5xl font-bold mb-8 tracking-wide drop-shadow-md">
                            {primaryEvent.name || 'Engagement Ceremony'}
                        </h2>

                        {/* Stacked Names */}
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-6xl md:text-[5.5rem] font-serif text-white font-bold tracking-tight leading-none drop-shadow-lg">
                                {primaryNames.first}
                            </h1>
                            <div className="text-5xl md:text-6xl italic text-[#E6C27A] font-serif my-4 drop-shadow-md">
                                &
                            </div>
                            <h1 className="text-6xl md:text-[5.5rem] font-serif text-white font-bold tracking-tight leading-none mb-12 drop-shadow-lg">
                                {primaryNames.second}
                            </h1>
                        </div>

                        {/* Details Block */}
                        <div className="text-white/90 space-y-2 mt-4 text-sm md:text-base tracking-wide font-medium">
                            <p>Venue</p>
                            <p>{data.wedding.displayDate}</p>
                            <p>{primaryEvent.time || '06:00 PM onwards'}</p>

                            <div className="mt-6">
                                <p className="max-w-[250px] md:max-w-sm mx-auto leading-relaxed">
                                    {primaryEvent.venue || 'Hotel Hyatt, In Magneto Mall\nAvanti Vihar, Raipur,\nChattisgarh 492001'}
                                </p>
                            </div>
                        </div>

                        {/* Footer text */}
                        <p className="text-white font-bold mt-12 text-base md:text-lg tracking-wide">
                            Please confirm your assistance
                        </p>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                        <ChevronDown className="w-6 h-6 text-[#E6C27A] animate-bounce opacity-80" strokeWidth={2} />
                    </div>
                </section>

                {/* Itinerary / Events Section (Adapted to Maroon) */}
                <section className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-20">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#E6C27A] drop-shadow-md">Additional Celebrations</h2>
                        <div className="w-16 h-px bg-[#E6C27A]/50 mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {data.celebrations.map((event, idx) => (
                            <div key={idx} className="bg-[#530A17] p-10 md:p-14 rounded-sm shadow-xl border border-[#E6C27A]/20 hover:border-[#E6C27A]/60 transition-colors duration-500 flex flex-col justify-between h-full relative overflow-hidden">
                                {/* Subtle background texture inside card */}
                                <img src="/themes/red-engagement/bg-texture.jpg" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay pointer-events-none" alt="" />

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-serif text-white mb-6">{event.name}</h3>
                                    <div className="space-y-5 text-sm text-white/80 font-light">
                                        <div className="flex items-start gap-4">
                                            <Calendar className="w-4 h-4 text-[#E6C27A] mt-0.5 shrink-0" />
                                            <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Clock className="w-4 h-4 text-[#E6C27A] mt-0.5 shrink-0" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <MapPin className="w-4 h-4 text-[#E6C27A] mt-0.5 shrink-0" />
                                            <span className="leading-relaxed">{event.venue}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RSVP Section */}
                <section className="relative py-32 px-6 z-20 bg-black/20">
                    <div className="max-w-2xl mx-auto">
                        <RSVPFormPlaceholder whatsapp={data.contact?.whatsapp} />
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative py-12 text-center bg-[#3A0710] text-white z-20">
                    <div className="w-8 h-8 mx-auto border border-[#E6C27A]/30 rounded-full flex items-center justify-center mb-6">
                        <span className="text-[#E6C27A] font-serif text-sm italic">{primaryNames.first[0]}</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/50">
                        Celebrating {primaryNames.first} & {primaryNames.second}
                    </p>
                </footer>
            </main>
        </div>
    );
}