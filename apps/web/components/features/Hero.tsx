"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function Hero() {
    const container = useRef<HTMLDivElement>(null);
    const title1Ref = useRef<HTMLDivElement>(null);
    const title2Ref = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useGSAP(() => {
        // Elegant staggered slide-up with fade
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1.2 } });

        tl.fromTo(
            [title1Ref.current, title2Ref.current, subtitleRef.current, buttonRef.current],
            { y: 50, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.1, delay: 0.2 }
        );
    }, { scope: container });

    return (
        <section ref={container} className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 w-full h-full">
                <Image
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=90&w=2940&ixlib=rb-4.0.3"
                    alt="Ethereal Wedding Layout"
                    fill
                    priority
                    className="object-cover"
                />
                {/* Subtle Warm Gradient Overlay */}
                <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
            </div>

            {/* Content */}
            <div className="z-10 flex flex-col items-center text-center px-6">
                {/* Headline with Staggered Lines */}
                <h1
                    className="text-[#FBFBF9] text-5xl md:text-8xl tracking-tight leading-none mb-6 relative overflow-hidden"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    <div ref={title1Ref} className="invisible">The Art of</div>
                    <div ref={title2Ref} className="invisible">Eternity</div>
                </h1>

                {/* Minimalist Subheadline */}
                <p
                    ref={subtitleRef}
                    className="text-[#FBFBF9] opacity-90 text-xs md:text-sm uppercase tracking-[0.2em] font-light max-w-xl mx-auto mb-12 invisible"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    Bridal Collections Defined by Light and Elegance
                </p>

                {/* Minimalist Call To Action */}
                <button
                    ref={buttonRef}
                    className="invisible relative group text-[#FBFBF9] text-xs uppercase tracking-widest py-4 px-8 border-b border-[#FBFBF9]/30 transition-colors duration-500 hover:text-black overflow-hidden"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <span className="relative z-10 transition-colors duration-500">Explore Collection</span>
                    {/* Fill effect from bottom */}
                    <span className="absolute left-0 bottom-0 w-full h-full bg-[#FBFBF9] transform origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 z-0" />
                </button>
            </div>
        </section>
    );
}
