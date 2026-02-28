"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brush, Code, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const splitRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Hero Title Animation: Masked slide up
        if (titleRef.current) {
            const words = titleRef.current.querySelectorAll('.word');
            gsap.fromTo(words,
                { y: "120%", opacity: 0 },
                {
                    y: "0%",
                    opacity: 1,
                    duration: 1.5,
                    stagger: 0.1,
                    ease: "power4.out",
                    delay: 0.2
                }
            );
        }

        // Philosophy Image Parallax
        if (splitRef.current) {
            const image = splitRef.current.querySelector('.parallax-image');
            gsap.to(image, {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: splitRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // Disciplines Fade Up
        if (columnsRef.current) {
            const columns = columnsRef.current.querySelectorAll('.discipline-col');
            gsap.fromTo(columns,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: columnsRef.current,
                        start: "top 80%",
                    }
                }
            );
        }
    }, { scope: heroRef });

    // Helper to wrap words in spans for the mask animation
    const renderHeroTitle = (text: string) => {
        return text.split(' ').map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 mr-4">
                <span className="word inline-block translate-y-[120%]">{word}</span>
            </span>
        ));
    };

    return (
        <div ref={heroRef} className="w-full bg-[#1A1A1A] text-[#FBFBF9] selection:bg-[#FBFBF9] selection:text-[#1A1A1A]">

            {/* Section 1: The Hero */}
            <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=2000" alt="Studio Background" fill className="object-cover opacity-20 mix-blend-luminosity" />
                </div>

                <div className="relative z-10 flex flex-col items-center w-full max-w-5xl text-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#C5B39A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>Our Story</span>

                    <h1 ref={titleRef} className="text-5xl md:text-7xl leading-[1.1] tracking-tight flex flex-wrap justify-center text-[#FBFBF9]" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {renderHeroTitle("Customized design for every wall and every wedding.")}
                    </h1>
                </div>
            </section>

            {/* Section 2: The Origin */}
            <section ref={splitRef} className="w-full bg-[#F2F1EC] text-[#1A1A1A] py-32 px-6 md:px-16 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 items-center">

                    {/* Left: Studio/Founder Image */}
                    <div className="md:col-span-5 relative w-full aspect-[4/5] overflow-hidden">
                        <div className="parallax-image absolute -inset-y-[15%] inset-x-0 w-full h-[130%]">
                            <Image src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" alt="Founders Studio" fill className="object-cover" />
                        </div>
                    </div>

                    {/* Right: The Origin Story */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-5xl leading-tight text-[#1A1A1A] mb-12" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Founded by three friends, Taksh Store was bootstrapped with a single vision: to bring highly customized, bespoke aesthetics into the modern Indian landscape.
                        </h2>

                        <div className="space-y-8 text-[#5A5A5A] leading-loose text-sm md:text-base max-w-2xl" style={{ fontFamily: 'var(--font-inter)' }}>
                            <p>
                                Whether it is a hand-crafted decorative painting for a home or office, or a flawless digital invitation for a wedding, we engineer art. Our journey started not in a boardroom, but in a shared workspace fueled by creativity and the desire to break away from mass-produced mediocrity.
                            </p>
                            <p>
                                Every texture on our digital experiences is born from physical mediums—heavy-body acrylics, curated photography, and deep intentionality. We don't just use templates; we curate the digital and physical exhibition of your most important life moments.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section 3: The Disciplines (2 Columns) */}
            <section ref={columnsRef} className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-32 px-6 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">

                        {/* Col 1 */}
                        <div className="discipline-col flex flex-col p-8 md:p-12 border border-[#333333] hover:border-[#C5B39A] transition-colors duration-500">
                            <div className="mb-12">
                                <Brush size={32} strokeWidth={1} className="text-[#C5B39A]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl tracking-tight mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>Wall Decorative Paintings</h3>
                            <p className="text-[#A3A3A3] leading-relaxed mb-8 text-sm md:text-base max-w-md" style={{ fontFamily: 'var(--font-inter)' }}>
                                Transforming Indian homes, shops, and corporate offices with custom physical art. We create massive abstract canvases and tailored commissions designed to breathe life into modern architecture.
                            </p>
                        </div>

                        {/* Col 2 */}
                        <div className="discipline-col flex flex-col p-8 md:p-12 border border-[#333333] hover:border-[#C5B39A] transition-colors duration-500 md:translate-y-16">
                            <div className="mb-12">
                                <Code size={32} strokeWidth={1} className="text-[#C5B39A]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl tracking-tight mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>Digital Wedding Experiences</h3>
                            <p className="text-[#A3A3A3] leading-relaxed mb-8 text-sm md:text-base max-w-md" style={{ fontFamily: 'var(--font-inter)' }}>
                                Designing immersive, zero-friction SaaS digital invites. We build bespoke scrolling web experiences combining elegant typography, dynamic RSVP forms, and stunning interactions for the modern couple.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Section 4: The Polardot Connection */}
            <section className="w-full bg-[#1A1A1A] border-t border-[#333333] py-24 px-6 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#5A5A5A] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>A Proud Sister Company</span>

                <h2 className="text-3xl md:text-4xl text-[#FBFBF9] mb-12" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Taksh Store operates in tandem with our parent studio, Polardot.
                </h2>

                <a
                    href="https://polardot.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs uppercase tracking-widest text-[#C5B39A] pb-2 border-b border-[#C5B39A] hover:text-[#FBFBF9] hover:border-[#FBFBF9] transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <ExternalLink size={14} className="mr-2" strokeWidth={1} /> VISIT POLARDOT.IN
                </a>
            </section>

        </div>
    );
}
