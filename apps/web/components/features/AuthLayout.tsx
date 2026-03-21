"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const rightColumnRef = useRef<HTMLDivElement>(null);
    const leftColumnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (leftColumnRef.current && rightColumnRef.current) {
            gsap.fromTo(
                leftColumnRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1.5, ease: "power2.out" }
            );
            gsap.fromTo(
                rightColumnRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 1.2, ease: "power2.out", delay: 0.2 }
            );
        }
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left Column (Editorial Side) */}
            <div
                ref={leftColumnRef}
                className="bg-secondary relative hidden lg:flex items-center justify-center p-16 overflow-hidden"
            >
                <Image
                    src="/main-website-assets/images/placeholder.webp" // Beautiful atelier/art inspired placeholder
                    alt="Taksh Store Atelier"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                <div className="relative z-10 text-center">
                    <h1 className="font-playfair text-5xl text-white tracking-wide">
                        Enter the Atelier.
                    </h1>
                </div>
            </div>

            {/* Right Column (Form Side) */}
            <div
                ref={rightColumnRef}
                className="bg-primary p-8 md:p-16 lg:p-32 flex flex-col justify-center relative z-20"
            >
                {children}
            </div>
        </div>
    );
}
