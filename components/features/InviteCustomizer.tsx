"use client";

import { useState } from "react";
import Image from "next/image";
import { useCollectionStore } from "../../store/useCollectionStore";
import { Product } from "../../types";
import { Type, Calendar, MapPin, AlignLeft, ShoppingBag } from "lucide-react";

interface InviteCustomizerProps {
    product: Product;
}

export default function InviteCustomizer({ product }: InviteCustomizerProps) {
    const { addItem, setIsOpen } = useCollectionStore();

    // Customization State
    const [coupleNames, setCoupleNames] = useState("Elena & Marcus");
    const [eventDate, setEventDate] = useState("October 14, 2026");
    const [venue, setVenue] = useState("Villa Balbiano, Lake Como");
    const [customMessage, setCustomMessage] = useState(
        "Together with their families, invite you to celebrate their marriage. Dinner and dancing to follow."
    );

    const handleSaveAndAdd = () => {
        // In a real app, this data would be saved to a database or passed in the item payload
        // For now, we add the base product type to the bag
        addItem(product);
        setIsOpen(true);
    };

    return (
        <div className="w-full min-h-screen bg-[#FBFBF9] grid grid-cols-1 lg:grid-cols-12 overflow-hidden text-[#1A1A1A]">

            {/* Left Column (The Live Preview) */}
            <div className="col-span-1 lg:col-span-7 bg-[#F2F1EC] flex items-center justify-center p-8 md:p-16 relative">

                {/* Abstract Background Texture for ambiance */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Image src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=1200" alt="Texture" fill className="object-cover" />
                </div>

                {/* The Canvas Card */}
                <div className="w-full max-w-md aspect-4/5 bg-[#FBFBF9] shadow-2xl relative p-12 flex flex-col items-center justify-center text-center border border-[#E5E4DF] z-10">

                    <h2
                        className="text-4xl text-[#1A1A1A] mb-8 tracking-tight wrap-break-word w-full"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {coupleNames || "Names Here"}
                    </h2>

                    <p
                        className="text-xs tracking-widest uppercase text-[#5A5A5A] mb-4"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {eventDate || "Date Here"}
                    </p>

                    <p
                        className="text-lg italic text-[#1A1A1A] mb-8 wrap-break-word w-full"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {venue || "Venue Here"}
                    </p>

                    <div className="w-8 h-px bg-[#C5B39A] mb-8" />

                    <p
                        className="text-xs leading-loose text-[#5A5A5A] wrap-break-word w-full px-4"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {customMessage || "Your custom message here."}
                    </p>

                </div>
            </div>

            {/* Right Column (The Control Panel) */}
            <div className="col-span-1 lg:col-span-5 bg-[#FBFBF9] p-8 md:p-16 lg:px-20 border-l border-[#E5E4DF] overflow-y-auto flex flex-col relative h-dvh">

                <h1
                    className="text-3xl text-[#1A1A1A] tracking-tight mb-12"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Personalize Your Canvas
                </h1>

                <div className="flex-1 flex flex-col">

                    {/* Couple's Names */}
                    <div className="mb-8">
                        <label
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5A5A5A] mb-4"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <Type size={14} strokeWidth={1} /> Couple's Names
                        </label>
                        <input
                            type="text"
                            value={coupleNames}
                            onChange={(e) => setCoupleNames(e.target.value)}
                            placeholder="e.g. Elena & Marcus"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#E5E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    {/* Event Date */}
                    <div className="mb-8">
                        <label
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5A5A5A] mb-4"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <Calendar size={14} strokeWidth={1} /> Event Date
                        </label>
                        <input
                            type="text"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            placeholder="e.g. October 14, 2026"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#E5E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    {/* Venue & Location */}
                    <div className="mb-8">
                        <label
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5A5A5A] mb-4"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <MapPin size={14} strokeWidth={1} /> Venue Collection
                        </label>
                        <input
                            type="text"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            placeholder="e.g. Villa Balbiano, Lake Como"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#E5E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    {/* Custom Message */}
                    <div className="mb-12">
                        <label
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5A5A5A] mb-4"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <AlignLeft size={14} strokeWidth={1} /> Invitation Message
                        </label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Your message here..."
                            rows={4}
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm leading-relaxed placeholder:text-[#E5E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors resize-none"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                </div>

                {/* Action Area (Pinned to bottom of scroll area) */}
                <div className="mt-auto pt-8 border-t border-[#E5E4DF] bg-[#FBFBF9]">
                    <div className="flex justify-between items-center mb-6">
                        <span
                            className="text-xs uppercase tracking-widest text-[#5A5A5A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {product.title} Suite
                        </span>
                        <span
                            className="text-lg text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            ${product.price.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={handleSaveAndAdd}
                        className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <ShoppingBag size={14} className="mr-2" strokeWidth={1} /> SAVE & ADD TO BAG
                    </button>
                </div>

            </div>

        </div>
    );
}
