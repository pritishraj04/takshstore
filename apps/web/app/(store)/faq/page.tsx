import { getApiUrl } from "@/lib/api";
import FAQAccordion from "@/components/features/FAQAccordion";

export const dynamic = 'force-dynamic';

async function getFaqs() {
    try {
        const res = await fetch(getApiUrl('/cms/faqs'), {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(10000) // 10s timeout
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function FAQPage() {
    const faqs = await getFaqs();
    return (
        <main className="w-full min-h-screen bg-[#F2F1EC] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">
            <h1 className="text-4xl md:text-6xl text-center mb-24" style={{ fontFamily: 'var(--font-playfair)' }}>
                Frequently Asked Questions
            </h1>
            <FAQAccordion initialFaqs={faqs} />
        </main>
    );
}
