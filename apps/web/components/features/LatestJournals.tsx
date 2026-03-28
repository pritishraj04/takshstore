"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/config/env";

export default function LatestJournals() {
    const [journals, setJournals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestJournals() {
            try {
                const res = await fetch(`${API_URL}/journals?limit=3`);
                if (res.ok) {
                    const data = await res.json();
                    setJournals(data);
                }
            } catch (err) {
                console.error("Failed to fetch journals", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLatestJournals();
    }, []);

    if (isLoading || journals.length === 0) {
        return null; // Gracefully hide when loading or empty
    }

    return (
        <section className="w-full bg-[#FBFBF9] py-24 md:py-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">
            <div className="max-w-7xl mx-auto">
                {/* Header Sequence */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-xl">
                        <span className="text-xs uppercase tracking-[0.3em] text-[#5A5A5A] mb-4 block" style={{ fontFamily: 'var(--font-inter)' }}>Editorial</span>
                        <h2 className="text-4xl md:text-5xl text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                            The Journal
                        </h2>
                    </div>
                    <Link
                        href="/journal"
                        className="flex items-center gap-2 text-sm text-[#1A1A1A] hover:text-[#5A5A5A] transition-colors uppercase tracking-[0.2em] group shrink-0"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        View All Entries
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={1} />
                    </Link>
                </div>

                {/* Journal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {journals.map((journal) => (
                        <Link key={journal.id} href={`/journal/${journal.slug}`} className="group block">
                            <div className="aspect-4/3 w-full overflow-hidden bg-[#F2F1EC] mb-6 relative">
                                {journal.coverImage ? (
                                    <img
                                        src={journal.coverImage}
                                        alt={journal.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#5A5A5A]/30">
                                        <span className="font-playfair text-xl">Taksh</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <span className="text-xs tracking-widest text-[#5A5A5A] uppercase border-b border-transparent group-hover:border-[#5A5A5A] pb-0.5 transition-colors inline-block" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                
                                <h3 className="text-xl md:text-2xl text-[#1A1A1A] group-hover:text-[#5A5A5A] transition-colors leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {journal.title}
                                </h3>
                                
                                {journal.excerpt && (
                                    <p className="text-sm text-[#8D8A80] leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-inter)' }}>
                                        {journal.excerpt}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
