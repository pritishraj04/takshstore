"use client";

import Link from "next/link";
import { LogOut, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <div className="flex flex-col min-h-screen bg-primary font-inter w-full">
            {/* Minimal App Header */}
            <header className="h-16 border-b border-light bg-primary sticky top-0 z-50 px-6 flex items-center justify-between shrink-0 bg-gray-50">
                <Link href="/dashboard" className="flex items-center group overflow-hidden">
                    {/* The SVG Logo (Always Visible) */}
                    <div className="relative z-10 shrink-0">
                        <img src="/logo-taksh.svg" alt="Taksh Store Icon" className="w-8 h-8 object-contain" />
                    </div>

                    {/* The Sliding Text (Expands at the top, collapses on scroll) */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-out flex items-center ${isScrolled
                            ? 'max-w-0 opacity-0 -translate-x-full'
                            : 'max-w-[200px] opacity-100 translate-x-0 ml-3'
                            }`}
                    >
                        <span className="font-serif text-lg md:text-xl tracking-widest uppercase whitespace-nowrap text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Taksh Store
                        </span>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-black transition-colors px-4 py-2 hover:bg-light/30 rounded-md">
                        <Home size={14} strokeWidth={1.5} />
                        <span>Storefront</span>
                    </Link>
                    <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-black transition-colors px-4 py-2 hover:bg-light/30 rounded-md">
                        <LogOut size={14} strokeWidth={1.5} />
                        <span>Log Out</span>
                    </button>
                </div>
            </header>

            {/* App Content Area */}
            <main className="flex-1 w-full bg-white relative">
                {children}
            </main>
        </div>
    );
}
