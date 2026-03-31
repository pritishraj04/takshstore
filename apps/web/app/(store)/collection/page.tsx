"use client";

import { useSearchParams, useRouter } from "next/navigation";
import CollectionGrid from "../../../components/features/CollectionGrid";
import { useProducts } from "../../../hooks/useProducts";
import { Loader2, Filter, X, ChevronRight } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { apiClient } from "../../../lib/apiClient";
import { Tag } from "../../../types";

type ProductTypeFilter = 'ALL' | 'PHYSICAL' | 'DIGITAL';

function CollectionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Type Filter (horizontal tabs)
    const typeSearch = (searchParams.get("type") as ProductTypeFilter) || 'ALL';
    
    // Tag Filters (sidebar)
    const tagsParam = searchParams.get("tags");
    const selectedTags = tagsParam ? tagsParam.split(",") : [];

    const { data: products, isLoading, isPlaceholderData } = useProducts(selectedTags);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isFetching = isLoading || isPlaceholderData;

    // Filter products by type (horizontal tabs)
    const filteredProducts = products ? products.filter(p => {
        if (typeSearch === 'ALL') return true;
        return p.type === typeSearch;
    }) : [];
    
    // FETCH TAGS logic remains same...
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data } = await apiClient.get<Tag[]>("/tags");
                setAllTags(data);
            } catch (e) {
                console.error("Failed to fetch tags", e);
            }
        };
        fetchTags();
    }, []);

    const toggleType = (type: ProductTypeFilter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === 'ALL') params.delete("type");
        else params.set("type", type);
        router.push(`/collection?${params.toString()}`);
    };

    const toggleTag = (slug: string) => {
        const newTags = selectedTags.includes(slug)
            ? selectedTags.filter((s) => s !== slug)
            : [...selectedTags, slug];

        const params = new URLSearchParams(searchParams.toString());
        if (newTags.length > 0) {
            params.set("tags", newTags.join(","));
        } else {
            params.delete("tags");
        }
        router.push(`/collection?${params.toString()}`);
    };

    return (
        <main className="bg-[#FBFBF9] min-h-screen">
            {/* Header Section */}
            <div className="w-full flex flex-col items-center justify-center pt-40 md:pt-48 pb-10">
                <h1
                    className="text-5xl md:text-7xl tracking-tight text-[#1A1A1A] mb-12 text-center"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    The Collection
                </h1>

                {/* Type Filter Toggles (Horizontal) */}
                <div
                    className="flex flex-wrap justify-center gap-4 md:gap-10 mb-16 px-6 text-[10px] tracking-[0.2em] uppercase transition-all font-bold"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <button
                        onClick={() => toggleType('ALL')}
                        className={`pb-2 border-b-2 transition-all ${typeSearch === 'ALL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#999] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        ALL WORKS
                    </button>
                    <button
                        onClick={() => toggleType('PHYSICAL')}
                        className={`pb-2 border-b-2 transition-all ${typeSearch === 'PHYSICAL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#999] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        CANVAS
                    </button>
                    <button
                        onClick={() => toggleType('DIGITAL')}
                        className={`pb-2 border-b-2 transition-all ${typeSearch === 'DIGITAL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#999] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        DIGITAL INVITES
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 md:px-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Filter - Starts after tabs */}
                    <aside className={`w-full lg:w-60 shrink-0 transition-opacity duration-300 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-32">
                            <h2 className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-[#1A1A1A] mb-8 pb-3 border-b border-[#E5E4DF]">Filter Dynamics</h2>
                            
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999] mb-6">Persona</h3>
                                    <div className="flex flex-col gap-4">
                                        {allTags.map(tag => (
                                            <label key={tag.id} className="flex items-center gap-3.5 group cursor-pointer select-none">
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedTags.includes(tag.slug)}
                                                        onChange={() => toggleTag(tag.slug)}
                                                        className="peer appearance-none w-4 h-4 border border-[#D1D0C9] rounded-none checked:bg-[#1A1A1A] checked:border-[#1A1A1A] transition-all duration-300 transform active:scale-90"
                                                    />
                                                    <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none transition-opacity duration-300">
                                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                            <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ${selectedTags.includes(tag.slug) ? 'text-[#1A1A1A] font-bold' : 'text-[#666] group-hover:text-[#1A1A1A]'}`}>
                                                    {tag.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Toggle Action */}
                    <div className="lg:hidden flex justify-end mb-8">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold border border-[#1A1A1A] px-6 py-3 bg-white hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm"
                        >
                            {isSidebarOpen ? <><X size={14} strokeWidth={1.5} /> Close Selection</> : <><Filter size={14} strokeWidth={1.5} /> Deploy Filters {selectedTags.length > 0 && `(${selectedTags.length})`}</>}
                        </button>
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-12 flex items-center justify-between min-h-[40px]">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium">
                                <span>{typeSearch.replace('ALL', 'Global')} Archive</span>
                                <ChevronRight size={10} />
                                <span className="text-[#1A1A1A]">Curated</span>
                                {selectedTags.length > 0 && (
                                    <>
                                        <ChevronRight size={10} />
                                        <span className="text-indigo-600 font-bold">{selectedTags.length} Active Layer</span>
                                    </>
                                )}
                                {isFetching && <Loader2 size={10} className="animate-spin ml-2 text-indigo-400" />}
                            </div>

                            {selectedTags.length > 0 && (
                                <button 
                                    onClick={() => router.push("/collection" + (typeSearch !== 'ALL' ? `?type=${typeSearch}` : ''))}
                                    className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#1A1A1A] hover:opacity-70 transition-opacity"
                                >
                                    Reset Selectors
                                </button>
                            )}
                        </div>
                        
                        <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                           <CollectionGrid products={filteredProducts} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CollectionPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
                <Loader2 size={32} className="animate-spin text-[#1A1A1A]" strokeWidth={1} />
            </main>
        }>
            <CollectionContent />
        </Suspense>
    );
}
