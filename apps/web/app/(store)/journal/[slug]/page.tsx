import { notFound } from "next/navigation";
import { Metadata } from "next";
import { API_URL } from "@/config/env";

async function getJournal(slug: string) {
    try {
        const res = await fetch(`${API_URL}/journals/${slug}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;

        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;
    const journal = await getJournal(slug);
    
    if (!journal) {
        return {
            title: "Journal Not Found",
        };
    }
    
    return {
        title: journal.title,
        description: journal.excerpt,
        openGraph: {
            title: journal.title,
            description: journal.excerpt,
            type: "article",
            publishedTime: journal.createdAt,
        },
        twitter: {
            card: "summary_large_image",
            title: journal.title,
            description: journal.excerpt,
        }
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;
    const journal = await getJournal(slug);
    
    if (!journal) {
        notFound();
    }
    
    const date = new Date(journal.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    }).toUpperCase();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: journal.title,
        datePublished: journal.createdAt,
        dateModified: journal.updatedAt,
        description: journal.excerpt,
        author: {
            "@type": "Organization",
            name: "Taksh",
        }
    };

    return (
        <main className="w-full flex-auto relative bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="max-w-4xl mx-auto flex flex-col items-center">
                <header className="mb-16 flex flex-col items-center gap-6 text-center border-b border-[#E5E4DF] pb-12 w-full">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#A3A3A3]" style={{ fontFamily: 'var(--font-inter)' }}>
                        {formattedDate}
                    </span>
                    <h1 className="text-4xl md:text-6xl text-[#1A1A1A] max-w-3xl leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {journal.title}
                    </h1>
                </header>

                {journal.coverImage && (
                    <div className="w-full mb-16 aspect-video overflow-hidden bg-[#F2F1EC]">
                        <img 
                            src={journal.coverImage} 
                            alt={journal.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div 
                    className="w-full text-lg text-[#5A5A5A] leading-relaxed max-w-3xl prose prose-neutral mx-auto"
                    style={{ fontFamily: 'var(--font-inter)' }}
                    dangerouslySetInnerHTML={{ __html: journal.content }}
                />
            </article>
        </main>
    );
}
