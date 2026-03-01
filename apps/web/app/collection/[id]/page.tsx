"use client";

import { use } from "react";
import ProductDetail from "../../../components/features/ProductDetail";
import { useProducts } from "../../../hooks/useProducts";
import { Loader2 } from "lucide-react";

export default function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params);
    const { data: products, isLoading } = useProducts();

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
                <Loader2 size={32} className="animate-spin text-[#1A1A1A]" strokeWidth={1} />
            </main>
        );
    }

    const product = products?.find(p => p.id === resolvedParams.id);

    if (!product) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
                <h1 className="text-xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>Artwork not found.</h1>
            </main>
        );
    }

    return (
        <main>
            <ProductDetail product={product} />
        </main>
    );
}
