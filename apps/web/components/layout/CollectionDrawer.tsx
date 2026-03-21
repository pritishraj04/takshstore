"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCollectionStore } from "../../store/useCollectionStore";
import { ShoppingBag } from "lucide-react";

export default function CollectionDrawer() {
    const { items, isOpen, setIsOpen, removeItem } = useCollectionStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration errors with persisted state
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <>
            {/* The Backdrop */}
            <div
                className={`fixed inset-0 z-100 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ease-out print:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* The Drawer Panel */}
            <aside
                className={`fixed top-0 right-0 h-dvh w-full md:w-[480px] bg-[#FBFBF9] shadow-2xl z-101 flex flex-col transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] print:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header Area */}
                <div className="flex justify-between items-center pt-12 px-8 pb-6 border-b border-[#E5E4DF]">
                    <h2
                        className="text-3xl text-[#1A1A1A] tracking-tight"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Your Bag
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs tracking-widest text-[#5A5A5A] uppercase hover:text-[#1A1A1A] transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        CLOSE
                    </button>
                </div>

                {/* Content Area */}
                {items.length === 0 ? (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-[#FBFBF9]">
                        <p
                            className="text-[#5A5A5A] mb-8 font-light"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            Your bag is empty.
                        </p>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="relative group text-xs uppercase tracking-widest text-[#1A1A1A] py-2 border-b border-[#E5E4DF] overflow-hidden"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="relative z-10 transition-colors duration-500">RETURN TO GALLERY</span>
                            <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0" />
                        </button>
                    </div>
                ) : (
                    // Populated State
                    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8 bg-[#FBFBF9]">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-6 items-start">

                                {/* Thumbnail */}
                                <div className="relative w-24 aspect-4/5 shrink-0 bg-[#F2F1EC]">
                                    <img
                                        src={item.imageUrl || '/assets/images/placeholder-product.jpg'}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col flex-1 justify-between h-full py-1">
                                    <div>
                                        <h3
                                            className="text-lg text-[#1A1A1A] mb-1 leading-tight"
                                            style={{ fontFamily: 'var(--font-playfair)' }}
                                        >
                                            {item.title}
                                        </h3>
                                        <p
                                            className="text-xs text-[#5A5A5A] uppercase tracking-widest mb-2"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        >
                                            {item.type} {item.quantity > 1 && `(x${item.quantity})`}
                                        </p>
                                        <p
                                            className="text-sm text-[#1A1A1A]"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        >
                                            ₹{item.price.toLocaleString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="self-start text-xs text-[#5A5A5A] underline underline-offset-4 hover:text-[#1A1A1A] transition-colors mt-2"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    >
                                        Remove
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* Footer/Checkout Area strictly if items exist */}
                {items.length > 0 && (
                    <div className="p-8 border-t border-[#E5E4DF] bg-[#FBFBF9] flex flex-col gap-6">
                        <div
                            className="flex justify-between items-center text-sm uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 text-center text-xs uppercase tracking-widest hover:bg-black transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <ShoppingBag size={14} className="mr-2 inline-block" strokeWidth={1.5} /> PROCEED TO CHECKOUT
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
