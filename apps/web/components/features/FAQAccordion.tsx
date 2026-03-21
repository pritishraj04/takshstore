"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQAccordion({ initialFaqs = [] }: { initialFaqs?: any[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (initialFaqs.length === 0) {
        return <p className="text-center text-[#5A5A5A] text-sm">FAQs are currently being updated. Check back later.</p>;
    }

    return (
        <div className="max-w-3xl mx-auto w-full">
            {initialFaqs.map((item, index) => (
                <div key={item.id || index} className="border-b border-[#E5E4DF] py-6">
                    <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex items-center justify-between text-left group"
                    >
                        <span className="text-sm tracking-wide text-[#1A1A1A] group-hover:text-[#5A5A5A] transition-colors pr-8 font-semibold" style={{ fontFamily: 'var(--font-inter)' }}>
                            {item.question}
                        </span>
                        <div className="shrink-0 text-[#1A1A1A] group-hover:text-[#5A5A5A] transition-colors">
                            {openIndex === index ? (
                                <Minus size={16} strokeWidth={1} />
                            ) : (
                                <Plus size={16} strokeWidth={1} />
                            )}
                        </div>
                    </button>

                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openIndex === index ? '1fr' : '0fr' }}
                    >
                        <div className="overflow-hidden">
                            <div 
                                className="text-sm leading-loose text-[#5A5A5A] mt-4 pb-4 prose prose-sm prose-p:font-inter prose-a:text-[#1A1A1A] prose-a:underline" 
                                dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
