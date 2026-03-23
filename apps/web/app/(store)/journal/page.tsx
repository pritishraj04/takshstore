import InsightsList from "@/components/features/InsightsList";
import { API_URL } from "@/config/env";

async function getArticles() {
    try {
        const res = await fetch(`${API_URL}/articles`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) return [];

        return res.json();
    } catch {
        return [];
    }
}

export default async function InsightsPage() {
    const articles = await getArticles();

    return (
        <main className="w-full flex-auto relative">
            <InsightsList articles={articles} />
        </main>
    );
}
