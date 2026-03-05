"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export default function StoryBlock() {
    const sectionRef = useRef<HTMLElement>(null);

    // Text Refs
    const microHeaderRef = useRef<HTMLHeadingElement>(null);
    const title1Ref = useRef<HTMLDivElement>(null);
    const title2Ref = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);

    // Image Refs
    const mainImageRef = useRef<HTMLDivElement>(null);
    const accentImageRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Text Reveal Timeline
        const textTl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 75%",
            },
            defaults: { ease: "power2.out", duration: 1.2 }
        });

        textTl.fromTo(
            [microHeaderRef.current, title1Ref.current, title2Ref.current, descRef.current, buttonRef.current],
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.15 }
        );

        // Images Clip-Path Reveal
        const imgTl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 65%",
            },
            defaults: { ease: "power2.inOut", duration: 1.6 }
        });

        imgTl.fromTo(
            mainImageRef.current,
            { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }
        ).fromTo(
            accentImageRef.current,
            { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
            "-=1.0" // Overlap the animation
        );

        // Optional: Subtle Parallax on the Accent Image
        gsap.to(accentImageRef.current, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });

    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            className="w-full py-32 px-6 md:px-16 bg-[#FBFBF9] text-[#1A1A1A] overflow-hidden"
        >
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 items-center">

                {/* Left Column: Text (Spanning ~5 cols) */}
                <div className="md:col-span-5 flex flex-col items-start text-left z-10 md:pr-12">
                    <h4
                        ref={microHeaderRef}
                        className="text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-8 invisible"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        OUR ETHOS
                    </h4>

                    <h2
                        className="text-4xl md:text-6xl tracking-tight leading-tight mb-8 relative"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        <div className="overflow-hidden"><div ref={title1Ref} className="invisible">The Perfection</div></div>
                        <div className="overflow-hidden"><div ref={title2Ref} className="invisible">of a Masterpiece</div></div>
                    </h2>

                    <p
                        ref={descRef}
                        className="text-[#5A5A5A] leading-loose font-light mb-12 invisible"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        We blend the profound texture of physical canvas paintings with the boundless potential of digital craftsmanship. Every invitation, every stroke, is a testament to the enduring beauty of art meeting modern elegance. Experience a gallery where your story becomes a timeless artifact.
                    </p>

                    <Link
                        href="/about"
                        ref={buttonRef}
                        className="inline-block invisible relative group text-xs uppercase tracking-widest text-[#1A1A1A] py-3 pr-8 border-b border-[#E5E4DF] transition-colors overflow-hidden"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <span className="relative z-10">Meet our story</span>
                        {/* Dark fill effect expanding from the left */}
                        <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0" />
                    </Link>
                </div>

                {/* Right Column: Images (Spanning ~7 cols) */}
                <div className="md:col-span-7 relative h-[600px] md:h-[800px] w-full mt-12 md:mt-0 flex justify-end">

                    {/* Main Image */}
                    <div
                        ref={mainImageRef}
                        className="relative w-full md:w-[85%] aspect-4/5 ml-auto"
                        style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }} // Initial state for JS-disabled fallback prevention
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=90&w=2000&ixlib=rb-4.0.3"
                            alt="Artisan crafting a piece"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    {/* Accent Image (Overlapping bottom-left) */}
                    <div
                        ref={accentImageRef}
                        className="absolute left-0 bottom-[10%] w-[55%] md:w-[45%] aspect-3/4 z-10 shadow-2xl shadow-black/10"
                        style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=90&w=1500&ixlib=rb-4.0.3"
                            alt="Detail of the masterpiece"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                        />
                    </div>

                </div>

            </div>
        </section>
    );
}
