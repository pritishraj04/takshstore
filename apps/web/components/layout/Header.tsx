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
import { Search, ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

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
    const { data: session, status } = useSession();

    // Zustand State
    const setIsOpen = useCollectionStore((state) => state.setIsOpen);
    const items = useCollectionStore((state) => state.items);
    const setSearchOpen = useSearchStore((state) => state.setIsOpen);

    // Hydration sync for persisted Zustand store to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const isDarkBg = pathname === '/' || pathname === '/about';
    const useLightText = isDarkBg && !isScrolled;

    const textColorPrimary = useLightText ? "text-[#FBFBF9]" : "text-[#1A1A1A]";
    const textColorSecondary = useLightText ? "text-[#FBFBF9]/90" : "text-[#5A5A5A]";
    const bgColorPrimary = useLightText ? "bg-[#FBFBF9]" : "bg-[#1A1A1A]";
    const groupHoverText = useLightText ? "group-hover:text-[#FBFBF9]" : "group-hover:text-[#1A1A1A]";

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Reset state and calculate initial scroll position explicitly on route change
        const isCurrentlyScrolled = window.scrollY > 20;
        setIsScrolled(isCurrentlyScrolled);
        
        if (isCurrentlyScrolled) {
            gsap.set(bgRef.current, { autoAlpha: 1 });
            gsap.set(borderRef.current, { scaleX: 1 });
        } else {
            gsap.set(bgRef.current, { autoAlpha: 0 });
            gsap.set(borderRef.current, { scaleX: 0 });
        }

        ScrollTrigger.create({
            start: "top -20",
            onEnter: () => {
                setIsScrolled(true);
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
                setIsScrolled(false);
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
    }, { scope: headerRef, dependencies: [pathname] });

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-16 md:py-8 print:hidden"
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

            {/* Left Nav Area (Mobile Menu Button & Desktop Links) */}
            <div className="flex-1 flex items-center">
                <button className="md:hidden flex items-center" aria-label="Menu" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={24} strokeWidth={1.5} className={`transition-colors duration-500 ${textColorPrimary}`} />
                </button>
                <nav className={`hidden md:flex gap-8 items-center text-xs uppercase tracking-widest transition-colors duration-500 ${textColorSecondary}`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link key={link.name} href={link.path} className="relative group overflow-hidden py-1">
                                <span className={`transition-colors duration-500 ${isActive ? textColorPrimary : `${textColorSecondary} ${groupHoverText}`}`}>
                                    {link.name}
                                </span>
                                <span
                                    className={`absolute left-0 bottom-0 w-full h-px ${bgColorPrimary} transform origin-left transition-transform duration-500 ease-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Logo (Center) */}
            <div className="flex-1 flex justify-start md:justify-center items-center">
                <Link href="/" className="flex items-center group overflow-hidden">
                    {/* The SVG Logo (Always Visible) */}
                    <div className="relative z-10 shrink-0">
                        <img src="/logo-taksh.svg" alt="Taksh Store Icon" className="w-8 h-8 object-contain transition-all duration-500" />
                    </div>

                    {/* The Sliding Text (Expands at the top, collapses on scroll) */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-out flex items-center ${isScrolled
                            ? 'max-w-0 opacity-0 -translate-x-full'
                            : 'max-w-[200px] opacity-100 translate-x-0 ml-3'
                            }`}
                    >
                        <span className={`font-serif text-lg md:text-xl tracking-widest uppercase whitespace-nowrap transition-colors duration-500 ${textColorPrimary}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                            Taksh Store
                        </span>
                    </div>
                </Link>
            </div>

            {/* Actions (Right) */}
            <div className={`flex-1 flex justify-end gap-3 md:gap-6 items-center text-xs uppercase tracking-widest transition-colors duration-500 ${textColorPrimary}`} style={{ fontFamily: 'var(--font-inter)' }}>
                <button className="relative group py-1 cursor-pointer" aria-label="Search" onClick={() => setSearchOpen(true)}>
                    <Search size={20} strokeWidth={1.5} className={`transition-colors duration-500 ${textColorPrimary}`} />
                </button>
                <button
                    className="relative group py-1 cursor-pointer"
                    onClick={() => setIsOpen(true)}
                    aria-label="Bag"
                >
                    <ShoppingBag size={20} strokeWidth={1.5} className={`transition-colors duration-500 ${textColorPrimary}`} />
                    {mounted && totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-medium text-white">
                            {totalItems}
                        </span>
                    )}
                </button>

                {status === 'loading' ? (
                    <div className="w-16 animate-pulse bg-gray-200 h-4 rounded"></div>
                ) : !session ? (
                    <Link href="/login" className="flex items-center gap-2 relative group py-1 overflow-hidden">
                        <User size={20} strokeWidth={1.5} className={`md:hidden transition-colors duration-500 ${textColorPrimary}`} />
                        <span className={`hidden md:block transition-colors duration-500 ${textColorSecondary} ${groupHoverText}`}>LOG IN</span>
                        <span className={`hidden md:block absolute left-0 bottom-0 w-full h-px ${bgColorPrimary} transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100`} />
                    </Link>
                ) : (
                    <>
                        <Link href="/dashboard" className="flex items-center gap-2 relative group py-1 overflow-hidden">
                            <User size={20} strokeWidth={1.5} className={`md:hidden transition-colors duration-500 ${textColorPrimary}`} />
                            <LayoutDashboard size={20} strokeWidth={1.5} className="shrink-0" />
                            <span className={`hidden md:block transition-colors duration-500 ${textColorSecondary} ${groupHoverText}`}>DASHBOARD</span>
                            <span className={`hidden md:block absolute left-0 bottom-0 w-full h-px ${bgColorPrimary} transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100`} />
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className={`hidden md:flex items-center gap-2 text-xs tracking-widest uppercase py-1 cursor-pointer transition-colors duration-500 ${textColorSecondary} ${groupHoverText}`}
                        >
                            <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
                            LOG OUT
                        </button>
                    </>
                )}
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between px-6 py-6 border-b border-[#E5E4DF]">
                        <span className="text-[#1A1A1A] text-xl tracking-wide uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu">
                            <X size={24} strokeWidth={1.5} className="text-[#1A1A1A]" />
                        </button>
                    </div>
                    <div className="flex flex-col p-6 gap-6 overflow-y-auto">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-lg uppercase tracking-widest ${isActive ? "text-[#1A1A1A] font-medium" : "text-[#5A5A5A]"}`}
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        <div className="border-t border-[#E5E4DF] my-4"></div>
                        <button
                            className="flex items-center gap-3 text-lg uppercase tracking-widest text-[#5A5A5A] w-fit"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsOpen(true);
                            }}
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            Bag {mounted && totalItems > 0 && `(${totalItems})`}
                        </button>
                        <button
                            className="flex items-center gap-3 text-lg uppercase tracking-widest text-[#5A5A5A] w-fit"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setSearchOpen(true);
                            }}
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <Search size={20} strokeWidth={1.5} />
                            Search
                        </button>
                    </div>
                    {session && (
                        <div className="mt-auto border-t border-[#E5E4DF] p-6">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-3 text-red-600 font-medium tracking-widest uppercase w-full cursor-pointer"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
