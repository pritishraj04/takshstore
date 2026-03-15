"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

interface SegueProps {
    subtitle?: string;
    title?: string;
    buttonLabel?: string;
    linkHref?: string;
    imageSrc?: string;
}

export default function Segue({
    subtitle = "YOUR GALLERY AWAITS",
    title = "Begin Your Collection",
    buttonLabel = "VIEW ALL WORKS",
    linkHref = "/collection",
    imageSrc = "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=90&w=2689&ixlib=rb-4.0.3"
}: SegueProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const bgImageRef = useRef<HTMLDivElement>(null);
    const segueTextRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Subtle scale down of the background image
        gsap.fromTo(bgImageRef.current,
            { scale: 1.15 },
            {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: bgImageRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                }
            }
        );

        // Fade up the deeply impactful segue text
        if (segueTextRef.current) {
            gsap.fromTo(segueTextRef.current.children,
                { y: 50, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    stagger: 0.15,
                    duration: 1.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: bgImageRef.current,
                        start: "top 60%",
                    }
                }
            );
        }
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="relative w-full min-h-[70vh] py-40 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Subtle Background Watermark Image */}
            <div ref={bgImageRef} className="absolute inset-0 w-full h-full -z-10 origin-center">
                <Image
                    src={imageSrc}
                    alt="Textured Abstract Canvas Background"
                    fill
                    priority={false}
                    className="object-cover"
                />
                {/* Revised Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-[#FBFBF9]/40 to-[#FBFBF9]/90 z-0" />
            </div>

            {/* The Text Content */}
            <div ref={segueTextRef} className="relative z-10 flex flex-col items-center justify-center px-6 max-w-2xl">
                <h4
                    className="text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-6 invisible"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    {subtitle}
                </h4>
                <h2
                    className="text-5xl md:text-7xl tracking-tight leading-tight text-[#1A1A1A] mb-12 invisible"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    {title}
                </h2>
                <Link
                    href={linkHref}
                    className="relative group text-xs uppercase tracking-widest text-[#1A1A1A] px-8 py-4 border border-[#1A1A1A] transition-colors overflow-hidden inline-flex items-center justify-center invisible"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <span className="relative z-10 transition-colors duration-500 group-hover:text-[#FBFBF9]">{buttonLabel}</span>
                    {/* Sliding dark bottom background on hover */}
                    <span className="absolute left-0 bottom-0 w-full h-full bg-[#1A1A1A] transform origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 z-0" />
                </Link>
            </div>
        </section>
    );
}
