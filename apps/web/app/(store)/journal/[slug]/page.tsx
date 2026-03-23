import { notFound } from "next/navigation";
import { Metadata } from "next";
import { API_URL } from "@/config/env";

async function getArticle(slug: string) {
    try {
        const res = await fetch(`${API_URL}/articles/${slug}`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) return null;

        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> } | { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticle(slug);
    
    if (!article) {
        return {
            title: "Article Not Found",
        };
    }
    
    return {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        openGraph: {
            title: article.metaTitle || article.title,
            description: article.metaDescription || article.excerpt,
            type: "article",
            publishedTime: article.publishedAt,
        },
        twitter: {
            card: "summary_large_image",
            title: article.metaTitle || article.title,
            description: article.metaDescription || article.excerpt,
        }
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> } | { params: { slug: string } }) {
    const { slug } = await params;
    const article = await getArticle(slug);
    
    if (!article) {
        notFound();
    }
    
    const date = new Date(article.publishedAt);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    }).toUpperCase();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        description: article.metaDescription || article.excerpt,
        articleSection: article.category,
        author: {
            "@type": "Organization",
            name: "Polardot",
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
                        {formattedDate} • {article.category}
                    </span>
                    <h1 className="text-4xl md:text-6xl text-[#1A1A1A] max-w-3xl leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {article.title}
                    </h1>
                </header>

                <div 
                    className="w-full text-lg text-[#5A5A5A] leading-relaxed max-w-3xl"
                    style={{ fontFamily: 'var(--font-inter)' }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </article>
        </main>
    );
}
