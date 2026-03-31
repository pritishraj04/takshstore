"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import { API_URL } from "@/config/env";

type VerificationState = "loading" | "success" | "error";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [state, setState] = useState<VerificationState>("loading");
    const [message, setMessage] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [resendState, setResendState] = useState<
        "idle" | "loading" | "sent"
    >("idle");

    const container = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (state !== "loading") {
                gsap.fromTo(
                    ".verify-animate",
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.12,
                        duration: 0.8,
                        ease: "power2.out",
                    }
                );
            }
        },
        { scope: container, dependencies: [state] }
    );

    useEffect(() => {
        if (!token) {
            setState("error");
            setMessage("No verification token found in the URL.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await axios.post(
                    `${API_URL}/auth/verify-email`,
                    { token }
                );
                setState("success");
                setMessage(
                    res.data?.message || "Email verified successfully."
                );
            } catch (err: any) {
                setState("error");
                setMessage(
                    err.response?.data?.message ||
                        "Invalid or expired verification link."
                );
            }
        };

        verifyEmail();
    }, [token]);

    const handleResendVerification = async () => {
        if (!resendEmail.trim()) return;
        setResendState("loading");

        try {
            await axios.post(`${API_URL}/auth/resend-verification`, {
                email: resendEmail,
            });
            setResendState("sent");
        } catch {
            setResendState("sent"); // Always show success for security (server does the same)
        }
    };

    return (
        <div
            ref={container}
            className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6"
        >
            <div className="w-full max-w-md">
                {/* ── Loading State ── */}
                {state === "loading" && (
                    <div className="text-center py-20">
                        <Loader2
                            className="mx-auto mb-6 animate-spin text-[#1A1A1A]"
                            size={40}
                            strokeWidth={1.5}
                        />
                        <h2 className="font-playfair text-2xl text-[#1A1A1A] tracking-wide mb-2">
                            Verifying Your Email
                        </h2>
                        <p className="font-inter text-sm text-[#8a8a8a] font-light tracking-wide">
                            Please wait while we confirm your address...
                        </p>
                    </div>
                )}

                {/* ── Success State ── */}
                {state === "success" && (
                    <div className="text-center">
                        <div className="verify-animate">
                            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle
                                    className="text-emerald-600"
                                    size={32}
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="verify-animate">
                            <h2 className="font-playfair text-3xl text-[#1A1A1A] tracking-wide mb-3">
                                Email Verified Successfully
                            </h2>
                        </div>

                        <div className="verify-animate">
                            <p className="font-inter text-sm text-[#6a6a6a] font-light tracking-wide mb-10 leading-relaxed max-w-xs mx-auto">
                                {message} You can now sign in and explore Taksh
                                Store.
                            </p>
                        </div>

                        <div className="verify-animate">
                            <button
                                onClick={() => router.push("/login")}
                                className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-4 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors"
                            >
                                Continue to Login
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Error State ── */}
                {state === "error" && (
                    <div className="text-center">
                        <div className="verify-animate">
                            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <XCircle
                                    className="text-red-500"
                                    size={32}
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="verify-animate">
                            <h2 className="font-playfair text-3xl text-[#1A1A1A] tracking-wide mb-3">
                                Invalid or Expired Link
                            </h2>
                        </div>

                        <div className="verify-animate">
                            <p className="font-inter text-sm text-[#6a6a6a] font-light tracking-wide mb-10 leading-relaxed max-w-xs mx-auto">
                                {message}
                            </p>
                        </div>

                        {/* Resend Verification Form */}
                        {resendState !== "sent" ? (
                            <div className="verify-animate">
                                <p className="font-inter text-xs text-[#8a8a8a] mb-4 tracking-wide">
                                    Enter your email to receive a new
                                    verification link.
                                </p>

                                <div className="relative mb-4">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8a8a8a] pb-3">
                                        <Mail strokeWidth={1} size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={resendEmail}
                                        onChange={(e) =>
                                            setResendEmail(e.target.value)
                                        }
                                        placeholder="Email Address"
                                        className="w-full bg-transparent border-b border-[#e5e4df] pb-3 pl-8 text-sm outline-none focus:border-[#1A1A1A] transition-colors text-[#1A1A1A] font-inter font-light"
                                    />
                                </div>

                                <button
                                    onClick={handleResendVerification}
                                    disabled={
                                        resendState === "loading" ||
                                        !resendEmail.trim()
                                    }
                                    className="bg-[#1A1A1A] text-[#FBFBF9] w-full py-4 text-xs tracking-widest uppercase font-inter hover:bg-[#333] transition-colors disabled:opacity-50 mb-4"
                                >
                                    {resendState === "loading"
                                        ? "Sending..."
                                        : "Request New Link"}
                                </button>
                            </div>
                        ) : (
                            <div className="verify-animate">
                                <div className="bg-emerald-50 border border-emerald-200 rounded px-4 py-3 mb-4">
                                    <p className="font-inter text-xs text-emerald-700 tracking-wide">
                                        If an unverified account with that email
                                        exists, a new verification link has
                                        been sent. Please check your inbox.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="verify-animate">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-xs text-[#8a8a8a] underline font-inter hover:text-[#1A1A1A] transition-colors tracking-wide"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
                    <Loader2
                        className="animate-spin text-[#1A1A1A]"
                        size={40}
                        strokeWidth={1.5}
                    />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
