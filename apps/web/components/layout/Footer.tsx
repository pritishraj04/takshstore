"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const bgImageRef = useRef<HTMLDivElement>(null);
    const segueTextRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

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
    }, { scope: footerRef });

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <footer ref={footerRef} className="w-full flex flex-col bg-[#FBFBF9] text-[#1A1A1A] print:hidden">

            {/* 
        Part 1: The Pre-Footer Segue (The Invitation)
      */}
            <section className="relative w-full min-h-[70vh] py-40 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Subtle Background Watermark Image */}
                <div ref={bgImageRef} className="absolute inset-0 w-full h-full -z-10 origin-center">
                    <Image
                        src="https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=90&w=2689&ixlib=rb-4.0.3"
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
                        YOUR GALLERY AWAITS
                    </h4>
                    <h2
                        className="text-5xl md:text-7xl tracking-tight leading-tight text-[#1A1A1A] mb-12 invisible"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Begin Your Collection
                    </h2>
                    <Link
                        href="/collection"
                        className="relative group text-xs uppercase tracking-widest text-[#1A1A1A] px-8 py-4 border border-[#1A1A1A] transition-colors overflow-hidden inline-flex items-center justify-center invisible"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <span className="relative z-10 transition-colors duration-500 group-hover:text-[#FBFBF9]">VIEW ALL WORKS</span>
                        {/* Sliding dark bottom background on hover */}
                        <span className="absolute left-0 bottom-0 w-full h-full bg-[#1A1A1A] transform origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 z-0" />
                    </Link>
                </div>
            </section>

            {/* 
        Part 2: The Minimalist Footer (The Anchor)
      */}
            <section className="w-full pt-16 pb-8 px-6 md:px-16 border-t border-[#E5E4DF] bg-[#FBFBF9]">
                <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                    {/* Column 1: Brand & Newsletter */}
                    <div className="col-span-1 md:col-span-2 flex flex-col items-start pr-0 md:pr-12">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <img src="/logo-taksh.svg" alt="Taksh Store Icon" className="w-8 h-8 object-contain" />
                            <span className="font-serif text-xl tracking-widest uppercase whitespace-nowrap text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>
                                Taksh Store
                            </span>
                        </Link>
                        <form className="w-full max-w-sm relative mt-2 group">
                            <input
                                type="email"
                                placeholder="Subscribe for updates"
                                className="w-full bg-transparent border-b border-[#E5E4DF] py-3 pr-12 text-[#1A1A1A] placeholder-[#5A5A5A] text-sm font-light focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
                                style={{ fontFamily: 'var(--font-inter)' }}
                                required
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-[#1A1A1A] font-light group-focus-within:text-[#C5B39A] transition-colors"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                JOIN
                            </button>
                        </form>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="col-span-1 flex flex-col gap-4">
                        <Link href="/collection" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>Collection</Link>
                        <Link href="/about" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>The Atelier</Link>
                        <Link href="/how-to-order" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>How to Order</Link>
                        <Link href="/journal" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>Journal</Link>
                    </div>

                    {/* Column 3: Legal & Help */}
                    <div className="col-span-1 flex flex-col gap-4">
                        <Link href="/contacts" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>Contact Us</Link>
                        <Link href="/faq" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>FAQ</Link>
                        <Link href="/terms" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>Terms of Service</Link>
                        <Link href="/privacy" className="text-sm font-light text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>Privacy Policy</Link>
                    </div>

                </div>

                {/* Bottom Sub-Footer Bar */}
                <div
                    className="mt-20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5A5A5A] uppercase tracking-widest w-full max-w-[1600px] mx-auto"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <span>© 2026 Taksh Store</span>
                    <div className="flex gap-6">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" aria-label="Instagram">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors" aria-label="Pinterest">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" x2="12" y1="22" y2="2" />
                                <path d="M5 10.5a7 7 0 0 1 14 0c0 4.33-3.23 7.5-7 7.5s-7-3.17-7-7.5z" />
                                <path d="M12 18v-8" />
                            </svg>
                        </a>
                    </div>
                </div>

            </section>

        </footer>
    );
}
