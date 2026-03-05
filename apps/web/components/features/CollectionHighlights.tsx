"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

// Register Draggable
if (typeof window !== "undefined") {
    gsap.registerPlugin(Draggable);
}

import { Product } from "../../types";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface CollectionHighlightsProps {
    products: Product[];
    isLoading: boolean;
}

export default function CollectionHighlights({ products, isLoading }: CollectionHighlightsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!trackRef.current || !containerRef.current) return;

        // Make the horizontal track draggable
        Draggable.create(trackRef.current, {
            type: "x",
            bounds: containerRef.current,
            inertia: true, // Requires ThrowPropsPlugin usually, but let's emulate smooth edge bounds
            edgeResistance: 0.65,
        });
    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            className="w-full py-16 md:py-32 pl-6 md:pl-16 bg-[#FBFBF9] text-[#1A1A1A] overflow-hidden cursor-grab active:cursor-grabbing"
        >
            <div className="mb-12 md:mb-20 pr-6 md:pr-16 flex justify-between items-end">
                <h2
                    className="text-4xl md:text-6xl tracking-tight"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Curated Masterpieces
                </h2>
                {/* Subtle drag indicator */}
                <span
                    className="text-[#5A5A5A] text-xs uppercase tracking-widest hidden md:block opacity-60"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    Drag to explore →
                </span>
            </div>

            {/* The Drag Track */}
            <div
                ref={trackRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-16 pb-8 scrollbar-hide w-max"
            >
                {isLoading ? (
                    <div className="w-full flex justify-center items-center py-20 px-8">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
                    </div>
                ) : (
                    products.map((product) => (
                        <article
                            key={product.id}
                            className="min-w-[300px] md:min-w-[350px] snap-center shrink-0"
                        >
                            <ProductCard product={product} />
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
