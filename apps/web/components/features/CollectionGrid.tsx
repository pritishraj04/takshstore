"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Product } from "../../types";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useCreateDraft } from "../../hooks/useDigitalInvite";
import { ShoppingBag, Loader2 } from "lucide-react";

interface CollectionGridProps {
    products: Product[];
}

type FilterType = 'ALL' | 'PHYSICAL' | 'DIGITAL';

export default function CollectionGrid({ products }: CollectionGridProps) {
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [filteredProducts, setFilteredProducts] = useState(products);
    const gridRef = useRef<HTMLDivElement>(null);
    const { addItem, setIsOpen } = useCollectionStore();
    const router = useRouter();

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

    // Use mutation for digital products
    const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();

    const handleAddToCart = (product: Product) => {
        if (product.type === 'DIGITAL') {
            createDraft(product.id, {
                onSuccess: (data) => {
                    router.push(`/customizer/${data.id}`);
                }
            });
            return;
        }
        addItem(product);
        setIsOpen(true);
    };

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
                    <div key={product.id} className="product-card group flex flex-col items-center cursor-pointer">

                        {/* Image Wrapper (Link to Detail Page) */}
                        <Link href={`/collection/${product.id}`} className="relative w-full aspect-4/5 overflow-hidden bg-[#F2F1EC] block">
                            <Image
                                src={product.imageUrl || "https://images.unsplash.com/photo-1544078755-9a8492027b1f"}
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transform scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </Link>


                        {/* Details */}
                        <div className="mt-8 flex flex-col items-center text-center">
                            <h3
                                className="text-xl md:text-2xl text-[#1A1A1A] mb-2 leading-tight"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {product.title}
                            </h3>
                            <p
                                className="text-xs uppercase tracking-widest text-[#5A5A5A]"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                {product.type === 'PHYSICAL' ? 'Physical Canvas' : 'Digital Suite'} — ₹{product.price.toLocaleString()}
                            </p>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(product);
                                }}
                                disabled={isCreatingDraft}
                                className="mt-6 inline-flex items-center text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#E5E4DF] pb-1 opacity-0 translate-y-4 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 hover:border-[#1A1A1A] disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                {isCreatingDraft && product.type === 'DIGITAL' ? (
                                    <><Loader2 size={14} className="mr-2 animate-spin" strokeWidth={1.5} /> WORKING...</>
                                ) : (
                                    <><ShoppingBag size={14} className="mr-2" strokeWidth={1.5} /> {product.type === 'DIGITAL' ? 'PERSONALIZE' : 'ADD TO BAG'}</>
                                )}
                            </button>
                        </div>

                    </div>
                ))}
            </div>

        </section>
    );
}
