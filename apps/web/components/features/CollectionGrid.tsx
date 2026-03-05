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
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [filteredProducts, setFilteredProducts] = useState(products);
    const gridRef = useRef<HTMLDivElement>(null);

    // Handle Filtering
    useEffect(() => {
        if (filter === 'ALL') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.type === filter));
        }
    }, [filter, products]);

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
    }, [filteredProducts]);

    return (
        <section className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A]">

            {/* Filter Header */}
            <div className="w-full flex flex-col items-center justify-center pt-32 pb-16">
                <h1
                    className="text-5xl md:text-7xl tracking-tight text-[#1A1A1A] mb-12 text-center"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    The Collection
                </h1>

                {/* Filter Toggles */}
                <div
                    className="flex flex-wrap justify-center gap-8 mb-24 px-6 text-xs tracking-widest uppercase transition-colors"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`pb-2 border-b transition-colors ${filter === 'ALL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#5A5A5A] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        ALL WORKS
                    </button>
                    <button
                        onClick={() => setFilter('PHYSICAL')}
                        className={`pb-2 border-b transition-colors ${filter === 'PHYSICAL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#5A5A5A] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        CANVAS
                    </button>
                    <button
                        onClick={() => setFilter('DIGITAL')}
                        className={`pb-2 border-b transition-colors ${filter === 'DIGITAL' ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#5A5A5A] border-transparent hover:text-[#1A1A1A]'}`}
                    >
                        DIGITAL INVITES
                    </button>
                </div>
            </div>

            {/* The Grid */}
            <div
                ref={gridRef}
                className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-6 md:px-16 pb-40"
            >
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

        </section>
    );
}
