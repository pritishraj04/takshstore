"use client";

import CollectionGrid from "../../components/features/CollectionGrid";
import { useProducts } from "../../hooks/useProducts";
import { Loader2 } from "lucide-react";

export default function CollectionPage() {
    const { data: products, isLoading } = useProducts();

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
                <Loader2 size={32} className="animate-spin text-[#1A1A1A]" strokeWidth={1} />
            </main>
        );
    }

    return (
        <main>
            <CollectionGrid products={products || []} />
        </main>
    );
}
