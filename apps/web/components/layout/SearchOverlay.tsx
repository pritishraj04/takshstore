"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import { X, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDebounce } from "use-debounce";
import { MOCK_ARTICLES } from "@/components/features/InsightsList";

// Generic Search Result Type
type SearchResultItem = {
    id: string;
    title: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'JOURNAL';
    href: string;
    categoryLabel: string;
};

export default function SearchOverlay() {
    const { isOpen, setIsOpen } = useSearchStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery] = useDebounce(searchQuery, 400);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { data: searchResults, isLoading, isFetching } = useQuery<SearchResultItem[]>({
        queryKey: ["search", debouncedQuery],
        queryFn: async () => {
            if (debouncedQuery.length < 2) return [];
            
            // 1. Fetch Dynamic Products
            const { data: productData } = await apiClient.get(`/products?q=${encodeURIComponent(debouncedQuery)}`);
            
            const productResults: SearchResultItem[] = productData.map((p: any) => ({
                id: p.id,
                title: p.title,
                type: p.type as 'PHYSICAL' | 'DIGITAL',
                href: `/collection/${p.id}`,
                categoryLabel: p.type === 'DIGITAL' ? 'Digital Suite' : 'Physical Collection'
            }));

            // 2. Filter Static Journal Entries
            const queryLower = debouncedQuery.toLowerCase();
            const journalResults: SearchResultItem[] = MOCK_ARTICLES
                .filter(a => a.title.toLowerCase().includes(queryLower) || a.category.toLowerCase().includes(queryLower))
                .map(a => ({
                    id: a.id,
                    title: a.title,
                    type: 'JOURNAL',
                    href: `/journal/${a.slug}`,
                    categoryLabel: 'Journal Insight'
                }));

            // 3. Return combined results (Products First)
            return [...productResults, ...journalResults];
        },
        enabled: debouncedQuery.length >= 2,
    });

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
            className="fixed inset-0 z-120 bg-[#FBFBF9]/95 backdrop-blur-md flex flex-col px-6 md:px-16 pt-32 pb-16 overflow-y-auto selection:bg-[#1A1A1A] selection:text-[#FBFBF9] print:hidden"
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
                    className="w-full md:w-2/3 bg-transparent border-b border-[#E5E4DF] pb-4 text-3xl sm:text-5xl md:text-7xl text-[#1A1A1A] placeholder:text-[#5A5A5A]/30 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                />
            </div>

            {/* Results Area (Conditional) */}
            {searchQuery.length >= 2 && (
                <div className="w-full max-w-[1600px] mx-auto mt-16 md:mt-24 pb-16">
                    <div className="col-span-full mb-8">
                        <span className="text-[10px] uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
                            {isLoading || isFetching || searchQuery !== debouncedQuery ? "SEARCHING..." : "SEARCH RESULTS"}
                        </span>
                    </div>

                    {isLoading || isFetching || searchQuery !== debouncedQuery ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#1A1A1A]" size={32} strokeWidth={1} />
                        </div>
                    ) : (() => {
                        const productResults = searchResults?.filter(r => r.type !== 'JOURNAL') || [];
                        const journalResults = searchResults?.filter(r => r.type === 'JOURNAL') || [];
                        
                        if (productResults.length === 0 && journalResults.length === 0) {
                            return (
                                <div className="py-12 text-[#5A5A5A] font-light" style={{ fontFamily: 'var(--font-inter)' }}>
                                    No results found for "{searchQuery}". Try a different term.
                                </div>
                            );
                        }

                        return (
                            <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Products Section */}
                                <div>
                                    <h2 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#A3A3A3] mb-6 md:mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                                        Products & Services
                                    </h2>
                                    {productResults.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
                                            {productResults.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.href}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="flex flex-col group pt-6 transition-colors border-t border-[#E5E4DF] hover:border-[#1A1A1A]"
                                                >
                                                    <ArrowUpRight size={14} strokeWidth={1} className="mb-4 md:mb-6 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 text-[#5A5A5A] group-hover:text-[#1A1A1A]" />
                                                    <h3 className="text-xl md:text-2xl text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                                        {item.title}
                                                    </h3>
                                                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-3 md:mt-4 block font-medium text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                                        {item.categoryLabel}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-[#5A5A5A] font-light border-t border-[#E5E4DF]" style={{ fontFamily: 'var(--font-inter)' }}>
                                            No products found for "{searchQuery}".
                                        </div>
                                    )}
                                </div>

                                {/* Journal Section (Conditional) */}
                                {journalResults.length > 0 && (
                                    <div>
                                        <h2 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#A3A3A3] mb-6 md:mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                                            Journal & Editorial
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
                                            {journalResults.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.href}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="flex flex-col group pt-6 transition-colors border-t border-[#C5B39A] hover:border-[#8C7A61] bg-[#F2F1EC]/50 hover:bg-[#F2F1EC] p-4 rounded-sm"
                                                >
                                                    <ArrowUpRight size={14} strokeWidth={1} className="mb-4 md:mb-6 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 text-[#C5B39A] group-hover:text-[#8C7A61]" />
                                                    <h3 className="text-xl md:text-2xl text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                                        {item.title}
                                                    </h3>
                                                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-3 md:mt-4 block font-medium text-[#8C7A61]" style={{ fontFamily: 'var(--font-inter)' }}>
                                                        {item.categoryLabel}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

        </div>
    );
}
