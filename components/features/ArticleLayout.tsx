"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ArticleProps {
    article: {
        slug: string;
        date: string;
        category: string;
        title: string;
        author: string;
        heroImage: string;
        content: React.ReactNode;
    }
}

export default function ArticleLayout({ article }: ArticleProps) {
    const router = useRouter();

    return (
        <div className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">

            {/* Article Header */}
            <header className="w-full pt-40 pb-16 px-6 md:px-16 lg:px-64 text-center border-t border-[#E5E4DF]">
                <div className="text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    <span>INSIGHTS &nbsp;/&nbsp; {article.category}</span>
                </div>

                <h1 className="text-5xl md:text-7xl leading-[1.1] text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {article.title}
                </h1>

                <div className="mt-8 text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
                    {article.date} &nbsp;&mdash;&nbsp; By {article.author}
                </div>
            </header>

            {/* Hero Image */}
            <div className="w-full aspect-video md:aspect-[21/9] relative overflow-hidden mb-24 max-w-[1600px] mx-auto">
                <Image
                    src={article.heroImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Body Text */}
            <article className="max-w-3xl mx-auto px-6 md:px-0 pb-32">
                <div className="prose prose-lg prose-p:font-['var(--font-inter)'] prose-p:text-lg prose-p:leading-[2.2] prose-p:text-[#5A5A5A] prose-p:mb-8 max-w-none">
                    {article.content}
                </div>

                {/* Back Button */}
                <div className="mt-32 pt-16 border-t border-[#E5E4DF] flex justify-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-xs uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#5A5A5A] transition-colors duration-300"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <ArrowLeft size={14} className="mr-3" strokeWidth={1} />
                        Return to Journal
                    </button>
                </div>
            </article>

        </div>
    );
}
