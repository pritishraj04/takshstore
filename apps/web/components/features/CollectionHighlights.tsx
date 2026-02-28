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

const mockHighlights = [
    {
        id: 1,
        title: "Le Jardin Secret",
        category: "Canvas Painting",
        price: "$2,400",
        image: "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=90&w=2689&ixlib=rb-4.0.3",
    },
    {
        id: 2,
        title: "Ethereal Vows",
        category: "Digital Invite Masterpiece",
        price: "$450",
        image: "https://images.unsplash.com/photo-1583939003504-f5a6cc0b5f1e?auto=format&fit=crop&q=90&w=2787&ixlib=rb-4.0.3",
    },
    {
        id: 3,
        title: "Whispers of Silk",
        category: "Canvas Painting",
        price: "$1,850",
        image: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?auto=format&fit=crop&q=90&w=2000&ixlib=rb-4.0.3",
    },
    {
        id: 4,
        title: "The Golden Hour",
        category: "Digital Invite Masterpiece",
        price: "$380",
        image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=90&w=2070&ixlib=rb-4.0.3",
    },
    {
        id: 5,
        title: "Midnight Opulence",
        category: "Canvas Painting",
        price: "$3,100",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=90&w=2545&ixlib=rb-4.0.3",
    },
];

export default function CollectionHighlights() {
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
                className="flex gap-8 md:gap-16 w-max"
            >
                {mockHighlights.map((item) => (
                    <article
                        key={item.id}
                        className="group w-[75vw] md:w-[400px] lg:w-[450px] shrink-0"
                    >
                        {/* Zero border, zero shadow image container */}
                        <div className="relative w-full aspect-4/5 overflow-hidden bg-[#F2F1EC]">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 75vw, 450px"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 md:mt-6 flex flex-col items-start text-left">
                            <h3
                                className="text-lg md:text-xl text-[#1A1A1A]"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {item.title}
                            </h3>
                            <div
                                className="w-full flex justify-between items-center mt-1 text-[#5A5A5A] text-xs md:text-sm tracking-wide"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                <span className="uppercase">{item.category}</span>
                                <span>{item.price}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
