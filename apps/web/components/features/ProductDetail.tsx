"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCollectionStore } from "../../store/useCollectionStore";
import { Product } from "../../types";
import { useCreateDraft } from "../../hooks/useDigitalInvite";
import { ShoppingBag, Loader2 } from "lucide-react";

interface ProductDetailProps {
    product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);
    const { addItem, setIsOpen } = useCollectionStore();
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(product.imageUrl);
    const router = useRouter();

    const allImages = Array.from(new Set([product.imageUrl, ...(product.images || [])]));

    // GSAP Animations
    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Fade in the Right Column Sticky Details
        gsap.fromTo(rightColRef.current,
            { x: 20, autoAlpha: 0 },
            {
                x: 0,
                autoAlpha: 1,
                duration: 1.2,
                ease: "power2.out",
                delay: 0.2
            }
        );

        // Stagger Fade-Up for Left Column Images
        if (leftColRef.current) {
            const images = gsap.utils.toArray(leftColRef.current.children);

            images.forEach((img: any) => {
                gsap.fromTo(img,
                    { y: 50, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: img,
                            start: "top 80%",
                        }
                    }
                );
            });
        }

    }, { scope: containerRef });

    const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();

    const handlePrimaryAction = () => {
        if (product.type === 'DIGITAL') {
            createDraft(product.id, {
                onSuccess: (data) => {
                    router.push(`/customizer/${data.id}`);
                }
            });
        } else {
            addItem(product);
            setIsOpen(true);
        }
    };

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <section
            ref={containerRef}
            className="w-full bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16"
        >
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Left Column (The Art - Spanning 7 columns) */}
                <div ref={leftColRef} className="col-span-1 lg:col-span-7">
                    <div className="flex flex-col-reverse lg:flex-row gap-4 invisible">
                        {/* Thumbnail Column (Left on Desktop, Bottom on Mobile) */}
                        {allImages.length > 1 && (
                            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible snap-x scrollbar-hide py-2 lg:py-0">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`shrink-0 snap-center w-16 h-16 lg:w-20 lg:h-20 rounded-lg border-2 overflow-hidden transition-all ${activeImage === img ? 'border-[#1A1A1A] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img || '/assets/images/placeholder-product.jpg'} alt={`${product.title} view ${idx + 1}`} className="w-full h-full object-cover bg-[#F2F1EC]" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Active Image Display */}
                        <div className="relative w-full aspect-square lg:aspect-4/5 bg-[#F2F1EC] rounded-2xl overflow-hidden">
                            <img
                                src={activeImage || '/assets/images/placeholder-product.jpg'}
                                alt={product.title}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column (The Details - Spanning 5 columns) */}
                <div className="col-span-1 lg:col-span-5 relative">
                    <div ref={rightColRef} className="lg:sticky top-40 h-fit flex flex-col invisible">

                        <Link
                            href="/collection"
                            className="text-[10px] uppercase tracking-widest text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors mb-8 inline-flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span>←</span> COLLECTION / {product.type}
                        </Link>

                        <h1
                            className="text-5xl md:text-6xl text-[#1A1A1A] tracking-tight leading-tight mb-4"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            {product.title}
                        </h1>

                        <p
                            className="text-lg text-[#1A1A1A] font-light"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            ₹{product.price.toLocaleString()}
                        </p>

                        <p
                            className="mt-8 text-base text-[#5A5A5A] leading-loose font-light"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {product.type === 'PHYSICAL'
                                ? "This bespoke canvas embodies the interplay between memory and movement. Every brushstroke is intentionally curated to capture the ephemeral beauty of the moment, creating a timeless heirloom for the modern collector."
                                : "A masterfully crafted digital suite. Blending elegant typography with sweeping digital textures, this asset offers unparalleled aesthetic distinction for the discerning individual."
                            }
                        </p>

                        <button
                            onClick={handlePrimaryAction}
                            disabled={isCreatingDraft}
                            className="mt-12 w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center disabled:opacity-50"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {isCreatingDraft ? (
                                <><Loader2 size={14} className="mr-2 animate-spin" strokeWidth={1.5} /> PREPARING CANVAS...</>
                            ) : product.type === 'DIGITAL' ? (
                                <>PERSONALIZE SUITE</>
                            ) : (
                                <><ShoppingBag size={14} className="mr-2" strokeWidth={1.5} /> ADD TO BAG</>
                            )}
                        </button>

                        {/* Accordion Details */}
                        <div className="mt-16 flex flex-col border-t border-[#E5E4DF]">

                            {/* Accordion 1: Delivery */}
                            <div className="border-b border-[#E5E4DF]">
                                <button
                                    onClick={() => toggleAccordion('delivery')}
                                    className="w-full py-6 flex justify-between items-center text-xs uppercase tracking-widest text-[#1A1A1A]"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    <span>{product.type === 'PHYSICAL' ? 'Shipping & Handling' : 'Digital Delivery'}</span>
                                    <span className="text-lg font-light">{openAccordion === 'delivery' ? '−' : '+'}</span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordion === 'delivery' ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-sm text-[#5A5A5A] leading-relaxed font-light" style={{ fontFamily: 'var(--font-inter)' }}>
                                        {product.type === 'PHYSICAL'
                                            ? "Complimentary white-glove shipping worldwide. Each artwork is meticulously packed within a custom wooden crate ensuring absolute safety during transit. Allow 2-3 weeks for preparation."
                                            : "Instant access via secure download link upon commission completion. The suite includes ultra-high resolution assets formatted for immediate deployment."
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Accordion 2: Authenticity */}
                            <div className="border-b border-[#E5E4DF]">
                                <button
                                    onClick={() => toggleAccordion('auth')}
                                    className="w-full py-6 flex justify-between items-center text-xs uppercase tracking-widest text-[#1A1A1A]"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    <span>Authenticity</span>
                                    <span className="text-lg font-light">{openAccordion === 'auth' ? '−' : '+'}</span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordion === 'auth' ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-sm text-[#5A5A5A] leading-relaxed font-light" style={{ fontFamily: 'var(--font-inter)' }}>
                                        Accompanied by a hand-signed Certificate of Authenticity. Registered permanently in the Taksh Store digital ledger.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
