"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { User, Mail, Key, CheckCircle } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import { API_URL } from "@/config/env";

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(
            ".animate-y",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power2.out" }
        );
    }, { scope: container });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await axios.post(
                `${API_URL}/auth/register`,
                { name, email, password }
            );

            setIsRegistered(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "An error occurred during registration. Please try again."
            );
            setIsLoading(false);
        }
    };

    // ── Post-Registration Success State ──
    if (isRegistered) {
        return (
            <div ref={container} className="w-full max-w-md mx-auto text-center">
                <div className="animate-y">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle className="text-emerald-600" size={32} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="animate-y">
                    <h2 className="font-playfair text-3xl text-primary tracking-wide mb-3">
                        Check Your Inbox
                    </h2>
                </div>
                <div className="animate-y">
                    <p className="font-inter text-sm text-secondary font-light tracking-wide mb-2 leading-relaxed">
                        We&apos;ve sent a verification link to
                    </p>
                    <p className="font-inter text-sm text-primary font-medium tracking-wide mb-8">
                        {email}
                    </p>
                    <p className="font-inter text-xs text-secondary font-light tracking-wide mb-10 leading-relaxed">
                        Click the link in the email to verify your account. The link expires in 24 hours.
                    </p>
                </div>
                <div className="animate-y">
                    <Link
                        href="/login"
                        className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-5 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors block text-center"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div ref={container} className="w-full max-w-md mx-auto">
            <div className="animate-y">
                <h2 className="font-playfair text-4xl text-primary mb-2 tracking-wide">
                    Create an Account
                </h2>
                <p className="font-inter text-sm text-secondary mb-12 tracking-wide font-light">
                    Begin your commission or digital invite experience.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="animate-y">
                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary pb-3">
                        <User strokeWidth={1} size={18} />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full bg-transparent border-b border-light pb-3 pl-8 text-sm outline-none focus:border-primary transition-colors text-primary font-inter font-light"
                    />
                </div>

                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary pb-3">
                        <Mail strokeWidth={1} size={18} />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full bg-transparent border-b border-light pb-3 pl-8 text-sm outline-none focus:border-primary transition-colors text-primary font-inter font-light"
                    />
                </div>

                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary pb-3">
                        <Key strokeWidth={1} size={18} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-transparent border-b border-light pb-3 pl-8 text-sm outline-none focus:border-primary transition-colors text-primary font-inter font-light"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs mt-4 mb-4 font-inter">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-5 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors disabled:opacity-50 mt-4"
                >
                    {isLoading ? "Creating Account..." : "Register"}
                </button>
            </form>

            <div className="animate-y">
                <Link
                    href="/login"
                    className="text-xs text-secondary underline mt-8 text-center block font-inter hover:text-primary transition-colors tracking-wide"
                >
                    Already have an account? Sign in.
                </Link>
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 pb-4">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-gray-700 hover:text-gray-900 hover:underline">
                            Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-gray-700 hover:text-gray-900 hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
