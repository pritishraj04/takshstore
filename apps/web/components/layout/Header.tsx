"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useSearchStore } from "../../store/useSearchStore";
import { Search, ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

const NAV_LINKS = [
  { name: "About", path: "/about" },
  { name: "Collection", path: "/collection" },
  { name: "How to Order", path: "/how-to-order" },
  { name: "Contacts", path: "/contacts" },
];

// Extracted styles to eliminate JSX bloat
const FONTS = {
  inter: { fontFamily: 'var(--font-inter)' },
  playfair: { fontFamily: 'var(--font-playfair)' }
};
const SHARED_TRANSITION = "transition-all duration-500 ease-out";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Zustand
  const setIsOpen = useCollectionStore((state) => state.setIsOpen);
  const items = useCollectionStore((state) => state.items);
  const setSearchOpen = useSearchStore((state) => state.setIsOpen);

  // State
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Theme Logic
  const isDarkBg = pathname === '/' || pathname === '/about';
  const useLightText = isDarkBg && !isScrolled;

  const theme = {
    textPrimary: useLightText ? "text-[#FBFBF9]" : "text-[#1A1A1A]",
    textSecondary: useLightText ? "text-[#FBFBF9]/90" : "text-[#5A5A5A]",
    bgPrimary: useLightText ? "bg-[#FBFBF9]" : "bg-[#1A1A1A]",
    hoverText: useLightText ? "group-hover:text-[#FBFBF9]" : "group-hover:text-[#1A1A1A]"
  };

  // Hydration & Body Scroll Lock
  useEffect(() => {
    setMounted(true);
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // GSAP Scroll Animations
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isCurrentlyScrolled = window.scrollY > 20;
    setIsScrolled(isCurrentlyScrolled);

    gsap.set(bgRef.current, { autoAlpha: isCurrentlyScrolled ? 1 : 0 });
    gsap.set(borderRef.current, { scaleX: isCurrentlyScrolled ? 1 : 0 });

    const trigger = ScrollTrigger.create({
      start: "top -20",
      onEnter: () => {
        setIsScrolled(true);
        gsap.to([bgRef.current, borderRef.current], {
          autoAlpha: 1, scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0
        });
      },
      onLeaveBack: () => {
        setIsScrolled(false);
        gsap.to([bgRef.current, borderRef.current], {
          autoAlpha: 0, scaleX: 0, duration: 0.6, ease: "power2.out", stagger: 0
        });
      },
    });

    return () => trigger.kill(); // Cleanup
  }, { scope: headerRef, dependencies: [pathname] });

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-16 md:py-8 print:hidden">
      {/* Backgrounds */}
      <div ref={bgRef} className="absolute inset-0 bg-[#FBFBF9]/80 backdrop-blur-md -z-10" />
      <div ref={borderRef} className="absolute bottom-0 left-0 w-full h-px bg-[#E5E4DF] origin-left -z-10" />

      {/* Left: Mobile Toggle & Desktop Nav */}
      <div className="flex-1 flex items-center">
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={24} strokeWidth={1.5} className={`${SHARED_TRANSITION} ${theme.textPrimary}`} />
        </button>

        <nav className={`hidden md:flex gap-8 items-center text-xs uppercase tracking-widest ${SHARED_TRANSITION} ${theme.textSecondary}`} style={FONTS.inter}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path} className="relative group py-1">
                <span className={`whitespace-nowrap ${SHARED_TRANSITION} ${isActive ? theme.textPrimary : theme.hoverText}`}>
                  {link.name}
                </span>
                <span className={`absolute left-0 bottom-0 w-full h-px ${theme.bgPrimary} transform origin-left ${SHARED_TRANSITION} ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center: Dynamic Logo */}
      <div className="flex-1 flex justify-center items-center">
        <Link href="/" className="flex items-center group">
          <div className="relative z-10 shrink-0">
            <img src="/logo-taksh.svg" alt="Taksh" className={`w-8 h-8 object-contain ${SHARED_TRANSITION}`} />
          </div>
          {/* is scrolled or mobile view: hide text on mobile or when scrolled on desktop */}
          <div className={`overflow-hidden flex items-center ${SHARED_TRANSITION} ${isScrolled ? 'max-w-0 opacity-0 -translate-x-full' : 'max-w-0 md:max-w-[200px] opacity-0 md:opacity-100 -translate-x-full md:translate-x-0 ml-0 md:ml-3'}`}>
            <span className={`text-xl tracking-widest uppercase whitespace-nowrap ${SHARED_TRANSITION} ${theme.textPrimary}`} style={FONTS.playfair}>
              Taksh Store
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className={`flex-1 flex justify-end gap-3.5 md:gap-7 items-center text-xs uppercase tracking-widest ${SHARED_TRANSITION} ${theme.textPrimary}`} style={FONTS.inter}>
        <button className="relative group p-1.5 md:p-1" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search size={22} strokeWidth={1.5} className={`${SHARED_TRANSITION} md:w-5 md:h-5 hover:opacity-70`} />
        </button>

        <button className="relative group p-1.5 md:p-1" onClick={() => setIsOpen(true)} aria-label="Bag">
          <ShoppingBag size={22} strokeWidth={1.5} className={`${SHARED_TRANSITION} md:w-5 md:h-5 hover:opacity-70`} />
          {mounted && totalItems > 0 && (
            <span className="absolute top-0.5 right-0.5 md:-top-1.5 md:-right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-medium text-white shadow-sm">
              {totalItems}
            </span>
          )}
        </button>

        {status === 'loading' ? (
          <div className="hidden md:block w-16 animate-pulse bg-gray-200/50 h-4 rounded"></div>
        ) : !session ? (
          <Link href="/login" className="flex items-center gap-2 relative group p-1.5 md:p-1">
            <User size={22} strokeWidth={1.5} className={`md:hidden ${SHARED_TRANSITION}`} />
            <span className={`hidden md:block ${SHARED_TRANSITION} ${theme.textSecondary} ${theme.hoverText}`}>LOG IN</span>
            <span className={`hidden md:block absolute left-0 bottom-0 w-full h-px ${theme.bgPrimary} transform origin-left scale-x-0 ${SHARED_TRANSITION} group-hover:scale-x-100`} />
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 relative group p-1.5 md:p-1">
              <User size={22} strokeWidth={1.5} className={`md:hidden ${SHARED_TRANSITION}`} />
              <LayoutDashboard size={20} strokeWidth={1.5} className="hidden md:block shrink-0" />
              <span className={`hidden md:block ${SHARED_TRANSITION} ${theme.textSecondary} ${theme.hoverText}`}>DASHBOARD</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className={`hidden md:flex items-center gap-2 py-1 ${SHARED_TRANSITION} ${theme.textSecondary} ${theme.hoverText}`}>
              <LogOut size={14} strokeWidth={1.5} />
              LOG OUT
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-6 border-b border-[#E5E4DF]">
            <span className="text-[#1A1A1A] text-xl tracking-wide uppercase" style={FONTS.playfair}>Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu">
              <X size={24} strokeWidth={1.5} className="text-[#1A1A1A]" />
            </button>
          </div>

          <nav className="flex flex-col p-6 gap-6 overflow-y-auto" style={FONTS.inter}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg uppercase tracking-widest ${pathname === link.path ? "text-[#1A1A1A] font-medium" : "text-[#5A5A5A]"}`}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-[#E5E4DF] my-4"></div>

            <button className="flex items-center gap-3 text-lg uppercase tracking-widest text-[#5A5A5A] w-fit" onClick={() => { setIsMobileMenuOpen(false); setIsOpen(true); }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              Bag {mounted && totalItems > 0 && `(${totalItems})`}
            </button>

            <button className="flex items-center gap-3 text-lg uppercase tracking-widest text-[#5A5A5A] w-fit" onClick={() => { setIsMobileMenuOpen(false); setSearchOpen(true); }}>
              <Search size={20} strokeWidth={1.5} />
              Search
            </button>
          </nav>

          {session && (
            <div className="mt-auto border-t border-[#E5E4DF] p-6">
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 text-red-600 font-medium tracking-widest uppercase w-full" style={FONTS.inter}>
                <LogOut size={16} strokeWidth={1.5} />
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}