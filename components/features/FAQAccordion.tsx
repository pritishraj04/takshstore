"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
    {
        question: "How long does a custom physical canvas take to create?",
        answer: "Our physical paintings are meticulously hand-crafted using heavy-body acrylics. Depending on the size and complexity, commissions typically require 4 to 8 weeks before they are ready for secure shipping."
    },
    {
        question: "Can I modify my digital wedding invitation after purchasing?",
        answer: "Yes. Your initial purchase acts as a structural blueprint. You are entitled to two (2) comprehensive rounds of revisions post-delivery of the initial staging link. Further structural changes may incur layout fees."
    },
    {
        question: "Do you provide hosting for the digital invitations?",
        answer: "Absolutely. All digital experiences engineered by Taksh Store (in tandem with Polardot) include 12 months of premium, edge-ready hosting. You simply share the link with your guests."
    },
    {
        question: "Are your wall paintings framed?",
        answer: "We offer both rolled canvas and gallery-wrapped (stretched over a wooden frame) options. Due to the diverse framing tastes of our clients, we typically ship gallery-wrapped, allowing you to select an external floater frame that perfectly matches your interior architecture."
    },
    {
        question: "Is international shipping available for physical art?",
        answer: "Currently, our primary logistical focus is within India. However, for specific overseas commissions, please contact us directly so we can arrange specialized international art courier services."
    }
];

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-3xl mx-auto w-full">
            {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="border-b border-[#E5E4DF] py-6">

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
                            <p className="text-sm leading-loose text-[#5A5A5A] mt-4 pb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                                {item.answer}
                            </p>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
}
