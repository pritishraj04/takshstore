export const revalidate = 3600;

async function getDocument(slug: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
        const res = await fetch(`${API_URL}/cms/documents/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function PrivacyPage() {
    const doc = await getDocument('privacy-policy');
    
    if (!doc) {
        return (
            <main className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 text-center flex flex-col items-center justify-center">
                <h1 className="text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>Privacy Policy</h1>
                <p className="mt-8 text-gray-400">Content currently offline. Standby.</p>
            </main>
        );
    }

    return (
        <main className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">
            <h1 className="text-4xl md:text-6xl text-center mb-16" style={{ fontFamily: 'var(--font-playfair)' }}>
                {doc.title}
            </h1>

            <article 
                className="max-w-3xl mx-auto prose prose-sm md:prose-base prose-headings:font-playfair prose-headings:font-normal prose-p:font-inter prose-p:text-[#5A5A5A] prose-p:leading-loose prose-a:text-[#1A1A1A] prose-a:underline"
                dangerouslySetInnerHTML={{ __html: doc.content }}
            />
        </main>
    );
}
