"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Key } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password. Please try again.");
            setIsLoading(false);
        } else {
            router.push("/dashboard"); // Or wherever the dashboard resides
        }
    };

    return (
        <div ref={container} className="w-full max-w-md mx-auto">
            <div className="animate-y">
                <h2 className="font-playfair text-4xl text-primary mb-2 tracking-wide">
                    Welcome Back
                </h2>
                <p className="font-inter text-sm text-secondary mb-12 tracking-wide font-light">
                    Access your collection and bespoke drafts.
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
                    {isLoading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="animate-y">
                <Link
                    href="/register"
                    className="text-xs text-secondary underline mt-8 text-center block font-inter hover:text-primary transition-colors tracking-wide"
                >
                    Don't have an account? Create one.
                </Link>
            </div>
        </div>
    );
}
