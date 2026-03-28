"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useFeaturedReviews } from "../../hooks/useFeaturedReviews";

const placeholders = [
    {
        id: "p1",
        quote: "Every detail was imbued with a quiet, undeniable elegance. The canvas painting we commissioned has become the soulful centerpiece of our home—a true masterpiece.",
        author: "EMMA V.",
        type: "CUSTOM CANVAS",
        rating: 5
    },
    {
        id: "p2",
        quote: "The digital invites were not just links; they were ethereal experiences. Our guests were mesmerized by the delicate animations and the sheer luxury of the design.",
        author: "ALEXANDER CHEN",
        type: "DIGITAL INVITE SUITE",
        rating: 5
    },
    {
        id: "p3",
        quote: "Working with Taksh Store felt less like commissioning art and more like embarking on a creative journey with master artisans. Unparalleled quality.",
        author: "SOPHIA LORENZ",
        type: "BESPOKE ARTWORK",
        rating: 5
    }
];

export default function TestimonialsBlock() {
    const sectionRef = useRef<HTMLElement>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data: featuredReviews = [], isLoading } = useFeaturedReviews();

    const testimonials = featuredReviews.length > 0 
        ? featuredReviews.map((r: any) => ({
            id: r.id,
            quote: r.comment || "An exceptional experience with Taksh Store.",
            author: r.user?.name || "Private Collector",
            type: r.product?.title || "Bespoke Creation",
            rating: r.rating
        }))
        : placeholders;

    // Initial scroll reveal
    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(sectionRef.current,
            { y: 50, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: 1.4,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            }
        );
    }, { scope: sectionRef });

    // Handle crossfade animation on index change
    const handleTransition = (direction: 'next' | 'prev') => {
        if (!textContainerRef.current) return;

        // Fade out out current text
        gsap.to(textContainerRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                // Update state while invisible
                if (direction === 'next') {
                    setActiveIndex((prev) => (prev + 1) % testimonials.length);
                } else {
                    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
                }

                // Fade in new text
                gsap.fromTo(textContainerRef.current,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 }
                );
            }
        });
    };

    const activeTestimonial = testimonials[activeIndex] || placeholders[0];

    return (
        <section
            ref={sectionRef}
            className="w-full py-32 px-6 md:px-16 bg-[#F2F1EC] text-[#1A1A1A] invisible"
        >
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">

                {/* Section Header */}
                <div className="text-center mb-16 md:mb-24">
                    <h4
                        className="text-xs uppercase tracking-[0.2em] text-[#5A5A5A] mb-4"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        COLLECTOR STORIES
                    </h4>
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#1A1A1A]"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Quality proven by time
                    </h2>
                </div>

                {/* The Review Slider/Carousel */}
                <div className="w-full max-w-4xl text-center min-h-[300px] flex flex-col justify-center items-center">

                    <div ref={textContainerRef} className="flex flex-col items-center">
                        {/* Rating Stars */}
                        <div className="flex gap-1 mb-8">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={16} 
                                    className={i < (activeTestimonial.rating || 5) ? "fill-[#C5B39A] text-[#C5B39A]" : "text-gray-300"} 
                                />
                            ))}
                        </div>

                        {/* The Quote */}
                        <p
                            className="text-2xl md:text-3xl lg:text-4xl italic leading-relaxed md:leading-relaxed text-[#1A1A1A] max-w-3xl"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            "{activeTestimonial.quote}"
                        </p>

                        {/* The Author */}
                        <p
                            className="mt-8 md:mt-12 text-xs uppercase tracking-widest text-[#5A5A5A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            — {activeTestimonial.author}, {activeTestimonial.type}
                        </p>
                    </div>

                    {/* Controls */}
                    {testimonials.length > 1 && (
                        <div className="mt-16 flex gap-12 items-center">
                            <button
                                onClick={() => handleTransition('prev')}
                                className="relative group text-[#1A1A1A] text-xs uppercase tracking-widest py-2 border-b border-[#E5E4DF] overflow-hidden"
                                style={{ fontFamily: 'var(--font-inter)' }}
                                aria-label="Previous testimonial"
                            >
                                <ArrowLeft size={24} strokeWidth={1} className="relative z-10" />
                                <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-right scale-x-0 transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100 z-0" />
                            </button>
                            <button
                                onClick={() => handleTransition('next')}
                                className="relative group text-[#1A1A1A] text-xs uppercase tracking-widest py-2 border-b border-[#E5E4DF] overflow-hidden"
                                style={{ fontFamily: 'var(--font-inter)' }}
                                aria-label="Next testimonial"
                            >
                                <ArrowRight size={24} strokeWidth={1} className="relative z-10" />
                                <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0" />
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </section>
    );
}
