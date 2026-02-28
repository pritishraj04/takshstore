"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useSearchStore } from "../../store/useSearchStore";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

const navLinks = [
    { name: "About", path: "/about" },
    { name: "Collection", path: "/collection" },
    { name: "How to Order", path: "/how-to-order" },
    { name: "Contacts", path: "/contacts" },
];

export default function Header() {
    const headerRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const borderRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Zustand State
    const setIsOpen = useCollectionStore((state) => state.setIsOpen);
    const items = useCollectionStore((state) => state.items);
    const setSearchOpen = useSearchStore((state) => state.setIsOpen);

    // Hydration sync for persisted Zustand store to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            start: "top -50",
            onEnter: () => {
                gsap.to(bgRef.current, {
                    autoAlpha: 1,
                    duration: 0.6,
                    ease: "power2.out",
                });
                gsap.to(borderRef.current, {
                    scaleX: 1,
                    duration: 0.6,
                    ease: "power2.out",
                });
            },
            onLeaveBack: () => {
                gsap.to(bgRef.current, {
                    autoAlpha: 0,
                    duration: 0.6,
                    ease: "power2.out",
                });
                gsap.to(borderRef.current, {
                    scaleX: 0,
                    duration: 0.6,
                    ease: "power2.out",
                });
            },
        });
    }, { scope: headerRef });

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-16 md:py-8"
        >
            {/* Frosted Glass Background */}
            <div
                ref={bgRef}
                className="absolute inset-0 bg-[#FBFBF9]/80 backdrop-blur-md opacity-0 invisible -z-10"
            />
            {/* Expanding Bottom Border */}
            <div
                ref={borderRef}
                className="absolute bottom-0 left-0 w-full h-px bg-[#E5E4DF] origin-left scale-x-0 -z-10"
            />

            {/* Nav Sidebar Links (Left) */}
            <nav className="flex-1 hidden md:flex gap-8 items-center text-xs uppercase tracking-widest text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
                {navLinks.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                        <Link key={link.name} href={link.path} className="relative group overflow-hidden py-1">
                            <span className={`transition-colors duration-500 ${isActive ? "text-[#1A1A1A]" : "group-hover:text-[#1A1A1A]"}`}>
                                {link.name}
                            </span>
                            <span
                                className={`absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left transition-transform duration-500 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                    }`}
                            />
                        </Link>
                    );
                })}
            </nav>

            {/* Logo (Center) */}
            <div className="flex-1 flex justify-start md:justify-center items-center">
                <Link href="/" className="text-[#1A1A1A] text-xl md:text-2xl tracking-wide uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Taksh Store
                </Link>
            </div>

            {/* Actions (Right) */}
            <div className="flex-1 flex justify-end gap-6 items-center text-xs uppercase tracking-widest text-[#1A1A1A]" style={{ fontFamily: 'var(--font-inter)' }}>
                <button className="relative group py-1" aria-label="Search" onClick={() => setSearchOpen(true)}>
                    <Search size={18} strokeWidth={1.5} className="text-[#1A1A1A]" />
                </button>
                <button
                    className="relative group py-1"
                    onClick={() => setIsOpen(true)}
                    aria-label="Bag"
                >
                    <ShoppingBag size={18} strokeWidth={1.5} className="text-[#1A1A1A]" />
                    {mounted && totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-medium text-white">
                            {totalItems}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
