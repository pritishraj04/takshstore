"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import { X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

export default function SearchOverlay() {
    const { isOpen, setIsOpen } = useSearchStore();
    const [searchQuery, setSearchQuery] = useState("");
    const overlayRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // GSAP animations for opening/closing
    useEffect(() => {
        if (isOpen && overlayRef.current) {
            gsap.fromTo(overlayRef.current,
                { y: -30, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-120 bg-[#FBFBF9]/95 backdrop-blur-md flex flex-col px-6 md:px-16 pt-32 pb-16 overflow-y-auto selection:bg-[#1A1A1A] selection:text-[#FBFBF9]"
        >
            {/* Close Button */}
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-10 right-6 md:right-16 flex items-center text-[#1A1A1A] hover:text-[#5A5A5A] transition-colors"
            >
                <span className="text-[10px] uppercase tracking-widest mr-3" style={{ fontFamily: 'var(--font-inter)' }}>CLOSE</span>
                <X size={24} strokeWidth={1} />
            </button>

            {/* The Input Area */}
            <div className="w-full max-w-[1600px] mx-auto mt-12 md:mt-24 shrink-0">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the atelier..."
                    autoFocus
                    className="w-full md:w-2/3 bg-transparent border-b border-[#E5E4DF] pb-4 text-5xl md:text-7xl text-[#1A1A1A] placeholder:text-[#5A5A5A]/30 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                />
            </div>

            {/* Mock Results Area (Conditional) */}
            {searchQuery.length > 2 && (
                <div className="w-full max-w-[1600px] mx-auto mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">

                    <div className="col-span-full mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>SUGGESTED RESULTS</span>
                    </div>

                    {[
                        { title: "The Minimalist", category: "Digital Invite", link: "/collection/digital-minimalist" },
                        { title: "Abstract Gold Focus", category: "Physical Canvas", link: "/collection/abstract-gold" },
                        { title: "The Digital Craft", category: "Journal", link: "/journal/the-anatomy-of-a-digital-heirloom" }
                    ].map((result, index) => (
                        <Link
                            key={index}
                            href={result.link}
                            onClick={() => setIsOpen(false)}
                            className="flex flex-col group border-t border-[#E5E4DF] pt-6 hover:border-[#1A1A1A] transition-colors"
                        >
                            <ArrowUpRight size={14} strokeWidth={1} className="mb-6 text-[#5A5A5A] group-hover:text-[#1A1A1A] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            <h3 className="text-2xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {result.title}
                            </h3>
                            <span className="text-[10px] uppercase tracking-widest text-[#5A5A5A] mt-3 block" style={{ fontFamily: 'var(--font-inter)' }}>
                                {result.category}
                            </span>
                        </Link>
                    ))}

                </div>
            )}

        </div>
    );
}
