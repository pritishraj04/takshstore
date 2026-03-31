import InsightsList from "@/components/features/InsightsList";
import { API_URL } from "@/config/env";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Journal & Insights',
    description: 'Explore the storytelling behind our art. Crafting bespoke canvases and digital invitations, one insight at a time.',
};

export const dynamic = 'force-dynamic';

async function getJournals() {
    try {
        const res = await fetch(`${API_URL}/journals`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (!res.ok) return [];

        return res.json();
    } catch {
        return [];
    }
}

export default async function InsightsPage() {
    const journals = await getJournals();

    return (
        <main className="w-full flex-auto relative">
            <InsightsList articles={journals} />
        </main>
    );
}
