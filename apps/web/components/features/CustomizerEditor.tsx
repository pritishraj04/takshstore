"use client";

import { useEffect, useRef } from "react";
import { useDigitalInvite, useUpdateInvite } from "../../hooks/useDigitalInvite";
import { useInviteStore } from "../../store/useInviteStore";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useProducts } from "../../hooks/useProducts";
import { Loader2, ShoppingBag } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CustomizerEditorProps {
    inviteId: string;
}

export default function CustomizerEditor({ inviteId }: CustomizerEditorProps) {
    // 1. Fetch data from backend
    const { data, isLoading, isError } = useDigitalInvite(inviteId);
    const { mutate: updateInvite, isPending } = useUpdateInvite(inviteId);

    // 2. Local State / Zustand Hydration
    const setAllData = useInviteStore((state) => state.setAllData);
    const currentDraft = useInviteStore((state) => state.inviteData);
    const headerRef = useRef<HTMLDivElement>(null);
    const saveBtnRef = useRef<HTMLButtonElement>(null);

    // 3. Products & Cart
    const { data: products, isLoading: isLoadingProducts } = useProducts();
    const { addItem, setIsOpen } = useCollectionStore();
    const digitalProduct = products?.find(p => p.type === 'DIGITAL');

    // Hydrate store on mount once data is received
    useEffect(() => {
        if (data?.inviteData) {
            setAllData(data.inviteData);
        }
    }, [data, setAllData]);

    // Loading GSAP
    useGSAP(() => {
        if (isLoading) {
            gsap.fromTo(
                ".loading-text",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out", repeat: -1, yoyo: true }
            );
        }
    }, [isLoading]);

    // Save Animation GSAP
    useGSAP(() => {
        if (saveBtnRef.current) {
            if (isPending) {
                gsap.to(saveBtnRef.current, { backgroundColor: "#C5B39A", color: "#1A1A1A", duration: 0.3 });
            } else {
                gsap.to(saveBtnRef.current, { backgroundColor: "transparent", color: "#1A1A1A", duration: 0.8, ease: "power2.out" });
            }
        }
    }, [isPending]);

    const handleSave = () => {
        if (currentDraft) {
            updateInvite(currentDraft);
        }
    };

    const handleAddToBag = () => {
        if (digitalProduct) {
            addItem({
                id: digitalProduct.id,
                title: digitalProduct.title,
                price: digitalProduct.price,
                type: 'DIGITAL',
                imageUrl: digitalProduct.imageUrl || "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=800",
                inviteData: currentDraft
            } as any);
            setIsOpen(true);
        }
    };

    // Luxury Loading State
    if (isLoading) {
        return (
            <div className="bg-primary min-h-screen flex flex-col items-center justify-center font-playfair tracking-wide">
                <Loader2 size={32} className="animate-spin text-secondary mb-6" strokeWidth={1} />
                <h2 className="text-2xl text-primary loading-text">
                    Retrieving your atelier draft...
                </h2>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-primary min-h-screen flex flex-col items-center justify-center font-playfair tracking-wide">
                <h2 className="text-2xl text-red-800">Error retrieving draft.</h2>
                <p className="font-inter text-sm mt-4 text-secondary">
                    Please return to your dashboard and try again.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col relative pt-in">
            {/* Editor Save Header - Exists above the core layout to avoid layout shifts */}
            <div ref={headerRef} className="fixed top-24 right-6 md:right-16 z-50">
                <button
                    ref={saveBtnRef}
                    onClick={handleSave}
                    disabled={isPending}
                    className="font-inter text-[10px] md:text-xs uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A] py-3 px-6 md:px-8 hover:bg-[#1A1A1A] hover:text-[#FBFBF9] transition-all disabled:pointer-events-none"
                >
                    {isPending ? "Saving Draft..." : "Save Draft"}
                </button>
                <button
                    onClick={handleAddToBag}
                    disabled={isLoadingProducts || !digitalProduct}
                    className="font-inter text-[10px] md:text-xs uppercase tracking-widest bg-[#1A1A1A] text-[#FBFBF9] py-3 px-6 md:px-8 hover:bg-black transition-all ml-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    <ShoppingBag size={14} className="mr-2" strokeWidth={1.5} /> Add to Bag
                </button>
            </div>

            {/* 
        This is where the complex Customizer Canvas and Sidebar would go. 
        For now, we render a placeholder block to signify the workspace.
      */}
            <div className="flex-1 flex mt-32 px-6 md:px-16">
                {/* Sidebar Area Mock */}
                <div className="w-1/3 hidden lg:flex flex-col border-r border-light/50 pr-16 bg-primary">
                    <h3 className="font-playfair text-2xl text-primary mb-8 tracking-wide">Editor</h3>
                    <div className="w-full h-12 border-b border-light mb-4"></div>
                    <div className="w-full h-12 border-b border-light mb-4"></div>
                    <div className="w-full h-12 border-b border-light mb-4"></div>
                </div>

                {/* Canvas Area Mock */}
                <div className="flex-1 flex items-center justify-center bg-secondary/20 relative m-4 md:ml-16 border border-light/50 overflow-hidden">

                    {/* Simulating the hydrated data rendering */}
                    <div className="text-center p-12">
                        <h4 className="font-inter text-xs tracking-widest uppercase text-secondary mb-6">
                            Live Preview
                        </h4>
                        <h1 className="font-playfair text-5xl md:text-6xl lg:text-8xl text-primary tracking-tight mb-8">
                            {currentDraft?.couple?.partner1 || "Partner 1"} & {currentDraft?.couple?.partner2 || "Partner 2"}
                        </h1>
                        <p className="font-inter text-sm md:text-base text-secondary font-light max-w-xl mx-auto leading-relaxed">
                            {currentDraft?.wedding?.date || "Date Unspecified"} | {currentDraft?.wedding?.venue || "Venue Unspecified"}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
