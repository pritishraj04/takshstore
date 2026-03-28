import { getApiUrl } from "@/lib/api";

export const dynamic = 'force-dynamic';

async function getPrivacyContent() {
    const API_URL = getApiUrl();
    try {
        const res = await fetch(`${API_URL}/api/cms/content/PRIVACY`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(10000) // 10s timeout
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function PrivacyPage() {
    const privacyData = await getPrivacyContent();

    if (!privacyData || !privacyData.content) {
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
                Privacy Policy
            </h1>

            <article
                className="max-w-3xl mx-auto prose prose-sm md:prose-base prose-headings:font-playfair prose-headings:font-normal prose-p:font-inter prose-p:text-[#5A5A5A] prose-p:leading-loose prose-a:text-[#1A1A1A] prose-a:underline"
                dangerouslySetInnerHTML={{ __html: privacyData.content }}
            />
        </main>
    );
}
