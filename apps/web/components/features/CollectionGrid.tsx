"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Product } from "../../types";
import { useCollectionStore } from "../../store/useCollectionStore";
import ProductCard from "./ProductCard";

interface CollectionGridProps {
    products: Product[];
}

type FilterType = 'ALL' | 'PHYSICAL' | 'DIGITAL';

export default function CollectionGrid({ products }: CollectionGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    // GSAP Reveal on mount and filter change
    useGSAP(() => {
        if (!gridRef.current) return;

        // Slight delay to allow DOM to update from state change
        const ctx = gsap.context(() => {
            gsap.fromTo(".product-card",
                { y: 40, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out",
                    clearProps: "all"
                }
            );
        }, gridRef);

        return () => ctx.revert();
    }, [products]);

    return (
        <div
            ref={gridRef}
            className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24 pb-40"
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">No archived works match your current filter matrix.</p>
                </div>
            )}
        </div>
    );
}
