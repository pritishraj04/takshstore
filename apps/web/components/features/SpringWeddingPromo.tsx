"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function SpringWeddingPromo() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.fromTo(
            ".promo-animate-y",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out", delay: 0.2 }
        );
    }, { scope: containerRef });

    return (
        <section 
            ref={containerRef} 
            className="w-full bg-[#fdfaf6] py-16 md:py-24 px-6 md:px-16 lg:px-24 flex flex-col md:flex-row items-center gap-12 md:gap-20"
        >
            {/* Image Section */}
            <div className="w-full md:w-1/2 promo-animate-y">
                <div className="relative w-full aspect-4/5 md:aspect-square lg:aspect-4/5 overflow-hidden rounded-sm shadow-sm">
                    {/* Using standard img to avoid Next.js external domain config issues */}
                    <img 
                        src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80"
                        alt="Spring Wedding Celebration"
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                <span className="promo-animate-y uppercase tracking-[0.2em] text-xs font-inter text-gray-500 mb-4 block">
                    Curated For You
                </span>
                <h2 className="promo-animate-y font-playfair font-serif text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
                    Spring Wedding Season Special
                </h2>
                <p className="promo-animate-y font-inter font-light text-gray-600 text-base max-w-lg mb-10 leading-relaxed">
                    Embrace the season of love with our new Spring Collection. Discover ethereal designs and elegant essentials crafted to make your wedding events and memorable gifts absolutely unforgettable. 
                </p>
                <div className="promo-animate-y">
                    <Link
                        href="/collection"
                        className="inline-block relative group text-xs uppercase tracking-widest py-4 px-8 border border-gray-900 text-gray-900 transition-colors duration-500 hover:text-white overflow-hidden"
                    >
                        <span className="relative z-10 transition-colors duration-500">Shop the Collection</span>
                        <span className="absolute left-0 bottom-0 w-full h-full bg-gray-900 transform origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 z-0" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
