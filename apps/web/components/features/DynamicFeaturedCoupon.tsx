"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { API_URL } from "@/config/env";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function DynamicFeaturedCoupon() {
    const [coupon, setCoupon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await fetch(`${API_URL}/coupons/featured`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.isActive) {
                        setCoupon(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch featured coupon", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    useGSAP(() => {
        if (!loading && coupon) {
            gsap.fromTo(
                ".dynamic-banner-animate",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out", delay: 0.2 }
            );
        }
    }, [loading, coupon]);

    if (loading) return null; // Or a subtle skeleton
    if (!coupon) return null; // Do not render if no active featured coupon exists

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const hasImage = !!coupon.homeBannerImage;
    const bgStyle = hasImage 
        ? { backgroundImage: `url('${coupon.homeBannerImage}')` }
        : { backgroundColor: '#1A1A1A' };

    return (
        <section 
            ref={containerRef}
            className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex flex-col items-center justify-center text-center overflow-hidden"
        >
            {/* Background Image Container */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={bgStyle}
            >
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto">
                <span className="dynamic-banner-animate bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 inline-block">
                    Limited Time Offer
                </span>
                
                <h2 className="dynamic-banner-animate text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-widest mb-4">
                    {coupon.code}
                </h2>
                
                <p className="dynamic-banner-animate text-lg md:text-2xl text-gray-200 mt-2 font-light">
                    {coupon.description || `Get ${coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} Off Your Entire Order`}
                </p>
                
                <div className="dynamic-banner-animate mt-10">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                            copied 
                                ? "bg-green-500 text-white border-transparent" 
                                : "bg-white text-black hover:bg-gray-100"
                        }`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-5 h-5" /> Copied to Clipboard
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" /> Copy Code
                            </>
                        )}
                    </button>
                    {coupon.validUntil && (
                        <p className="text-xs text-gray-300/80 mt-4 uppercase tracking-widest font-medium">Valid until {new Date(coupon.validUntil).toLocaleDateString()}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
