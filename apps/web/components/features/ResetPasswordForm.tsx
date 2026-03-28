"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Key, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { toast } from "sonner";

function ResetPasswordFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const accountType = searchParams.get("type") as "USER" | "ADMIN";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(
            ".animate-y",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power2.out" }
        );
    }, { scope: container });

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    newPassword: password, 
                    type: accountType || 'USER' 
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to reset password");
            }

            setIsSuccess(true);
            toast.success("Password reset successful!");
            
            setTimeout(() => {
                const loginRedirect = accountType === "ADMIN" ? "/admin/login" : "/login";
                router.push(loginRedirect);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div ref={container} className="w-full max-w-md mx-auto text-center">
                <div className="animate-y flex flex-col items-center">
                    <CheckCircle2 className="text-green-600 mb-6" size={64} strokeWidth={1} />
                    <h2 className="font-playfair text-4xl text-primary mb-4 tracking-wide">
                        Success!
                    </h2>
                    <p className="font-inter text-sm text-secondary mb-12 tracking-wide font-light">
                        Your password has been reset. Redirecting you to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={container} className="w-full max-w-md mx-auto">
            <div className="animate-y">
                <h2 className="font-playfair text-4xl text-primary mb-2 tracking-wide">
                    Set New Password
                </h2>
                <p className="font-inter text-sm text-secondary mb-12 tracking-wide font-light">
                    Establish a secure credential for your {accountType?.toLowerCase() || 'account'} access.
                </p>
                
                {accountType && (
                    <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full mb-8">
                        {accountType === "ADMIN" ? <ShieldCheck size={14} className="text-primary" /> : <User size={14} className="text-primary" />}
                        <span className="text-[10px] uppercase tracking-widest font-inter font-medium">
                            {accountType} Reset
                        </span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="animate-y">
                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary pb-3">
                        <Key strokeWidth={1} size={18} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        required
                        disabled={!token || isLoading}
                        className="w-full bg-transparent border-b border-light pb-3 pl-8 text-sm outline-none focus:border-primary transition-colors text-primary font-inter font-light"
                    />
                </div>

                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary pb-3">
                        <Key strokeWidth={1} size={18} />
                    </div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        required
                        disabled={!token || isLoading}
                        className="w-full bg-transparent border-b border-light pb-3 pl-8 text-sm outline-none focus:border-primary transition-colors text-primary font-inter font-light"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs mb-6 font-inter">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-5 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors disabled:opacity-50 mt-4"
                >
                    {isLoading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordFormContent />
        </Suspense>
    );
}
