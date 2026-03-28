"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ShieldCheck, User } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ForgotPasswordFormProps {
    initialType?: "USER" | "ADMIN";
}

export default function ForgotPasswordForm({ initialType = "USER" }: ForgotPasswordFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [type, setType] = useState<"USER" | "ADMIN">(initialType);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
        setMessage("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to send reset link");
            }

            setMessage("If an account exists, a reset link has been sent to your email.");
            setEmail("");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={container} className="w-full max-w-md mx-auto">
            <div className="animate-y">
                <h2 className="font-playfair text-4xl text-primary mb-2 tracking-wide">
                    Recover Password
                </h2>
                <p className="font-inter text-sm text-secondary mb-12 tracking-wide font-light">
                    Enter your email to receive a secure reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="animate-y">
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

                {error && (
                    <p className="text-red-500 text-xs mb-6 font-inter">{error}</p>
                )}
                {message && (
                    <p className="text-green-600 text-xs mb-6 font-inter">{message}</p>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-5 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors disabled:opacity-50 mt-4"
                >
                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
            </form>

            <div className="animate-y">
                <Link
                    href="/login"
                    className="text-xs text-secondary underline mt-8 text-center block font-inter hover:text-primary transition-colors tracking-wide"
                >
                    Back to login
                </Link>
            </div>
        </div>
    );
}
