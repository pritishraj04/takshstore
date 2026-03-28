"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category?: string;
    createdAt: string;
}


export default function InsightsList({ articles = [] }: { articles: Article[] }) {
    const listRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!listRef.current) return;

        const items = listRef.current.querySelectorAll('.insight-item');
        gsap.fromTo(items,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.2
            }
        );
    }, { scope: listRef });

    return (
        <section className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl md:text-7xl mb-24" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Journal & Insights
                </h1>

                <div ref={listRef} className="flex flex-col w-full border-b border-[#E5E4DF]">
                    {articles.map((article) => {
                        const date = new Date(article.createdAt);
                        const formattedDate = date.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric"
                        }).toUpperCase();

                        return (
                            <Link
                                key={article.id}
                                href={`/journal/${article.slug}`}
                                className="insight-item group flex flex-col md:flex-row items-start md:items-center justify-between border-t border-[#E5E4DF] py-12 px-2 hover:bg-[#F2F1EC] transition-colors duration-500"
                            >
                                <div className="mb-6 md:mb-0 shrink-0 mr-12 flex flex-col gap-2 min-w-[120px]">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A3A3A3]" style={{ fontFamily: 'var(--font-inter)' }}>
                                        {formattedDate}
                                    </span>
                                    {article.category && (
                                        <span className="text-xs uppercase tracking-widest text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                            {article.category}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 transition-transform duration-500 group-hover:translate-x-4">
                                    <h2 className="text-3xl md:text-5xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-[#5A5A5A] max-w-2xl leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                        {article.excerpt}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
