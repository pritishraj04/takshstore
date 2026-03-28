"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { API_URL } from "@/config/env";

const mockArticles = [
    {
        id: 1,
        date: "FEBRUARY 27, 2026",
        title: "Floral Design Trends for Weddings",
        slug: "floral-design-trends-for-weddings"
    },
    {
        id: 2,
        date: "FEBRUARY 16, 2026",
        title: "Bridal Accessories That Elevate Any Look",
        slug: "bridal-accessories-that-elevate-any-look"
    },
    {
        id: 3,
        date: "FEBRUARY 9, 2026",
        title: "The Second Bridal Look: A Necessity or A Whim?",
        slug: "the-second-bridal-look"
    },
    {
        id: 4,
        date: "JANUARY 8, 2026",
        title: "Top 5 Wedding Dress Trends for 2026",
        slug: "top-5-wedding-dress-trends-2026"
    }
];

export default function InsightsBlock() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const journalRef = useRef<HTMLDivElement>(null);

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

    useGSAP(() => {
        if (isLoading || journals.length === 0) return;

        gsap.registerPlugin(ScrollTrigger);

        // Fade up the left-side header block
        gsap.fromTo(headerRef.current,
            { y: 30, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            }
        );

        // Stagger slide up the right-side article rows
        if (journalRef.current) {
            const journalNodes = journalRef.current.children;
            gsap.fromTo(journalNodes,
                { y: 30, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 1.2,
                    ease: "power2.out",
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }
    }, { scope: sectionRef, dependencies: [journals, isLoading] });
    
    if (isLoading || journals.length === 0) return null;

    return (
        <section
            ref={sectionRef}
            className="w-full py-32 px-6 md:px-16 bg-[#FBFBF9] text-[#1A1A1A] border-t border-[#E5E4DF]"
        >
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Left Area: Header (Spans ~4 cols) */}
                <div ref={headerRef} className="lg:col-span-4 flex flex-col items-start invisible">
                    <h2
                        className="text-4xl md:text-5xl tracking-tight leading-tight mb-6"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Insights and updates
                    </h2>
                    <p
                        className="text-[#5A5A5A] leading-relaxed font-light mb-10 max-w-sm"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        Taksh Store's journal on art, digital craft, and timeless wedding aesthetics. Explore our curated thoughts and inspiring trends.
                    </p>
                    <Link
                        href="/journal"
                        className="relative group text-[#1A1A1A] text-xs uppercase tracking-widest py-2 border-b border-[#E5E4DF] overflow-hidden"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <span className="relative z-10">View all journal entries</span>
                        {/* Sliding bottom border on hover */}
                        <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0" />
                    </Link>
                </div>

                {/* Right Area: Article List (Spans ~8 cols) */}
                <div ref={journalRef} className="lg:col-span-8 flex flex-col">
                    {journals.map((journal) => (
                        <Link
                            key={journal.id}
                            href={`/journal/${journal.slug}`}
                            className={`group flex items-center justify-between border-t border-[#E5E4DF] pt-6 pb-8 transition-colors duration-500 invisible`}
                        >
                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 w-full max-w-4xl cursor-pointer">
                                {/* Date */}
                                <span
                                    className="w-40 shrink-0 text-xs uppercase tracking-widest text-[#5A5A5A]"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    {journal.date}
                                </span>

                                {/* Title with hover shift */}
                                <h3
                                    className="text-2xl md:text-3xl text-[#1A1A1A] mt-2 md:mt-0 transform transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:text-[#C5B39A]"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    {journal.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}
