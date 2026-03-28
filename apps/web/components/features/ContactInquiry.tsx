"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

type InquiryType = "Wall Decorative Painting" | "Digital Wedding Invite" | "General Inquiry";

export default function ContactInquiry({ contactData }: { contactData?: any }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inquiryType, setInquiryType] = useState<InquiryType>("Wall Decorative Painting");

    useGSAP(() => {
        if (!containerRef.current) return;

        // Fade in left column text
        const leftElements = containerRef.current.querySelectorAll('.left-col-element');
        gsap.fromTo(leftElements,
            { opacity: 0, x: -20 },
            {
                opacity: 1,
                x: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.2
            }
        );

        // Slide up stagger for the right column form inputs
        const formElements = containerRef.current.querySelectorAll('.form-element');
        gsap.fromTo(formElements,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.5
            }
        );
    }, { scope: containerRef });

    const handleInquiryChange = (type: InquiryType) => {
        setInquiryType(type);
    };

    return (
        <div ref={containerRef} className="w-full min-h-screen bg-[#FBFBF9] grid grid-cols-1 lg:grid-cols-2 text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FBFBF9] pt-24 lg:pt-0 border-t border-[#E5E4DF]">

            {/* Left Column: Studio Details */}
            <div className="bg-[#FBFBF9] p-8 md:p-16 lg:p-24 flex flex-col justify-between pt-32 lg:pt-40">
                <div className="left-col-element">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#5A5A5A] mb-8 inline-block" style={{ fontFamily: 'var(--font-inter)' }}>Start a Conversation</span>
                    <h1 className="text-5xl md:text-6xl leading-tight text-[#1A1A1A] max-w-md" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Bespoke commissions and digital inquiries.
                    </h1>
                    <p className="text-sm text-[#5A5A5A] leading-loose mt-8 max-w-md" style={{ fontFamily: 'var(--font-inter)' }}>
                        Whether you are looking to transform a corporate office with a custom canvas, or seeking a highly tailored digital wedding experience, our founders are ready to bring your vision to life.
                    </p>
                </div>

                <div className="mt-24 flex flex-col gap-10">
                    <div className="left-col-element flex items-start gap-4">
                        <Mail size={16} strokeWidth={1} className="text-[#C5B39A] mt-1 shrink-0" />
                        <div>
                            <span className="block text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-2" style={{ fontFamily: 'var(--font-inter)' }}>Email</span>
                            <a href={`mailto:${contactData?.email || 'hello@takshstore.com'}`} className="text-sm border-b border-transparent hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all text-[#5A5A5A] pb-1 inline-block" style={{ fontFamily: 'var(--font-inter)' }}>
                                {contactData?.email || 'hello@takshstore.com'}
                            </a>
                        </div>
                    </div>

                    <div className="left-col-element flex items-start gap-4">
                        <Phone size={16} strokeWidth={1} className="text-[#C5B39A] mt-1 shrink-0" />
                        <div>
                            <span className="block text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-2" style={{ fontFamily: 'var(--font-inter)' }}>Phone / WhatsApp</span>
                            <span className="text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
                                {contactData?.phone || '+91 999 999 9999'}
                            </span>
                        </div>
                    </div>

                    <div className="left-col-element flex items-start gap-4">
                        <MapPin size={16} strokeWidth={1} className="text-[#C5B39A] mt-1 shrink-0" />
                        <div>
                            <span className="block text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-2" style={{ fontFamily: 'var(--font-inter)' }}>Studio & Hours</span>
                            <span className="text-sm text-[#5A5A5A] whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                {(contactData?.address || "Operating from Noida, India.\nServing spaces nationwide.") + "\n"}
                                <strong>{contactData?.hours || "Mon-Sat, 10am - 6pm"}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: The Form */}
            <div className="bg-[#F2F1EC] p-8 md:p-16 lg:p-24 border-l border-[#E5E4DF] flex flex-col justify-center pt-16 lg:pt-32">
                <form className="max-w-xl w-full mx-auto lg:mx-0" onSubmit={(e) => e.preventDefault()}>

                    <div className="form-element mb-12">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-transparent border-b border-[#DCDAD2] pb-4 text-sm text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none transition-colors placeholder:text-[#8D8A80]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    <div className="form-element mb-12">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent border-b border-[#DCDAD2] pb-4 text-sm text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none transition-colors placeholder:text-[#8D8A80]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    <div className="form-element mb-12">
                        <input
                            type="tel"
                            placeholder="Phone Number (WhatsApp preferred)"
                            className="w-full bg-transparent border-b border-[#DCDAD2] pb-4 text-sm text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none transition-colors placeholder:text-[#8D8A80]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    <div className="form-element mb-16">
                        <span className="block text-[10px] uppercase tracking-widest text-[#8D8A80] mb-6" style={{ fontFamily: 'var(--font-inter)' }}>Inquiry Type</span>
                        <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-8">
                            {[
                                "Wall Decorative Painting",
                                "Digital Wedding Invite",
                                "General Inquiry"
                            ].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleInquiryChange(type as InquiryType)}
                                    className={`flex items-center gap-3 text-[10px] uppercase tracking-widest transition-colors duration-300 ${inquiryType === type
                                            ? 'text-[#1A1A1A]'
                                            : 'text-[#8D8A80] hover:text-[#1A1A1A]'
                                        }`}
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${inquiryType === type ? 'border-[#1A1A1A]' : 'border-[#8D8A80]'}`}>
                                        {inquiryType === type && <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />}
                                    </div>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-element mb-12">
                        <textarea
                            placeholder="Tell us about your space, your wedding, or your vision..."
                            rows={4}
                            className="w-full bg-transparent border-b border-[#DCDAD2] pb-4 text-sm text-[#1A1A1A] resize-none focus:border-[#1A1A1A] focus:outline-none transition-colors placeholder:text-[#8D8A80]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        />
                    </div>

                    <div className="form-element">
                        <button
                            type="submit"
                            className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 mt-4 text-xs uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center justify-center group"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <ArrowRight size={14} className="mr-3 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
                            Submit Inquiry
                        </button>
                    </div>

                </form>
            </div>

        </div>
    );
}
