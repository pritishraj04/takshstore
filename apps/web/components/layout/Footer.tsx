"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Segue from "@/components/layout/Segue";

export default function Footer() {
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/register') return null;

    const isCollectionPage = pathname?.startsWith('/collection');

    return (
        <footer className="w-full flex flex-col bg-[#FBFBF9] text-[#1A1A1A] print:hidden">

            {/* 
        Part 1: The Pre-Footer Segue (The Invitation)
      */}
            {/* 
        Part 1: The Pre-Footer Segue (The Invitation)
      */}
            {isCollectionPage ? (
                <Segue 
                    subtitle="BEHIND THE CRAFT"
                    title="Read the Journal"
                    buttonLabel="EXPLORE INSIGHTS"
                    linkHref="/journal"
                />
            ) : (
                <Segue />
            )}

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
