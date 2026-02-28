"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brush, Code } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function OrderProcess() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        const timelineItems = containerRef.current.querySelectorAll('.timeline-item');

        gsap.fromTo(timelineItems,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%",
                }
            }
        );

    }, { scope: containerRef });

    return (
        <div className="w-full bg-[#FBFBF9] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">

            {/* Section 1: The Hero */}
            <section className="w-full py-40 px-6 flex flex-col items-center text-center bg-[#FBFBF9]">
                <span className="text-xs uppercase tracking-[0.3em] text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>The Process</span>

                <h1 className="text-5xl md:text-7xl leading-[1.1] tracking-tight text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Commissioning your vision.
                </h1>

                <p className="text-sm text-[#5A5A5A] max-w-2xl mx-auto leading-loose" style={{ fontFamily: 'var(--font-inter)' }}>
                    Whether securing a physical painting for your space or configuring a digital invitation for your wedding, our process is designed for absolute clarity. We operate at the intersection of fine art and precision engineering.
                </p>
            </section>

            {/* Section 2: The Bifurcated Timeline */}
            <section ref={containerRef} className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen border-t border-[#E5E4DF]">

                {/* Left Column: Physical Paintings */}
                <div className="bg-[#F2F1EC] p-8 md:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-[#E5E4DF]">
                    <div className="flex items-center mb-16">
                        <Brush size={24} strokeWidth={1} className="mr-6 text-[#1A1A1A]" />
                        <h2 className="text-4xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>Wall Decorative Paintings</h2>
                    </div>

                    <div className="border-l border-[#C5B39A] ml-3 pl-10 flex flex-col gap-16 relative">

                        {/* Step 1 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#F2F1EC]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>01. Consultation</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                Begin by contacting our studio team. We specialize in bespoke sizing to perfectly fit modern Indian homes, corporate offices, or boutique shops. We'll discuss your spatial requirements, color palettes, and artistic direction before providing a formal quote.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#F2F1EC]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>02. The Creation</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                Once commissioned, our artists prepare the raw canvas. Using heavy-body acrylics and specialized impasto techniques, your piece is meticulously hand-painted over several weeks, ensuring rich textures and archival quality.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#F2F1EC]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>03. Secure Shipping</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                Physical items require precise shipping logistics at checkout. Your artwork is carefully stretched, packaged in rigorous structural crating, and fully insured for safe transit directly to your door.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Right Column: Digital Invites */}
                <div className="bg-[#FBFBF9] p-8 md:p-16 lg:p-24 relative overflow-hidden">
                    <div className="flex items-center mb-16">
                        <Code size={24} strokeWidth={1} className="mr-6 text-[#1A1A1A]" />
                        <h2 className="text-4xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>Digital Wedding Experiences</h2>
                    </div>

                    <div className="border-l border-[#C5B39A] ml-3 pl-10 flex flex-col gap-16 relative z-10">

                        {/* Step 1 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#FBFBF9]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>01. The Customizer</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                Enter our real-time digital studio. Input your couple details, configure your event schedule (e.g., Haldi, Mehendi, Wedding), leave developer notes, and instantly preview how your digital invitation will look on mobile devices.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#FBFBF9]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>02. Frictionless Checkout</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                When your configuration is complete, add it to your bag. Our smart checkout flow detects digital products, completely bypassing unnecessary shipping address forms for a rapid, streamlined purchase experience.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="timeline-item relative">
                            <div className="absolute -left-[45px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] ring-4 ring-[#FBFBF9]" />
                            <h3 className="text-2xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>03. Development & Launch</h3>
                            <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                The Polardot and Taksh engineering team receives your exact brief. We build a bespoke, high-performance web link (powered by Next.js and deployed edge-ready) delivering the final, immersive experience directly to your email or WhatsApp to share with guests.
                            </p>
                        </div>

                    </div>
                </div>

            </section>

        </div>
    );
}
