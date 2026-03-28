import InsightsList from "@/components/features/InsightsList";
import { API_URL } from "@/config/env";

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
