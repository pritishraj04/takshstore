'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface RSVPFormProps {
    targetNumber: string;
    brideName: string;
    groomName: string;
}

export function RSVPForm({ targetNumber, brideName, groomName }: RSVPFormProps) {
    const [name, setName] = useState('');
    const [attendance, setAttendance] = useState('yes');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [whatsappWebUrl, setWhatsappWebUrl] = useState('');
    const [whatsappAppUrl, setWhatsappAppUrl] = useState('');
    const [hasRedirected, setHasRedirected] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }

        if (!targetNumber) {
            alert("Unable to load contact information.");
            return;
        }

        setIsSubmitting(true);

        const safeGroomName = groomName || "the Groom";
        const safeBrideName = brideName || "the Bride";

        let message = "";
        if (attendance === "yes") {
            message = `Hi ${safeGroomName} & ${safeBrideName}! I'm delighted to confirm my presence for your wedding celebrations.\nWarm regards,\n${name.trim()}`;
        } else {
            message = `Hi ${safeGroomName} & ${safeBrideName}! Thank you so much for the invitation. Unfortunately, I won't be able to attend the wedding.\nWith best wishes,\n${name.trim()}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanNumber = targetNumber.replace(/[^0-9]/g, '');

        const webUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        const appUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;

        setWhatsappWebUrl(webUrl);
        setWhatsappAppUrl(appUrl);
        setHasRedirected(false);
        setShowModal(true);
        setCountdown(5);
    };

    const triggerRedirect = (isManual = false) => {
        if (hasRedirected) return;
        setHasRedirected(true);
        setShowModal(false);

        if (isManual) {
            window.open(whatsappWebUrl, "_blank");
            setIsSubmitting(false);
            setName('');
        } else {
            // Try to open WhatsApp app directly via deep link
            window.location.href = whatsappAppUrl;

            // Fallback to web link if deep link fails
            setTimeout(() => {
                if (document.hasFocus()) {
                    window.location.href = whatsappWebUrl;
                }
            }, 500);

            setIsSubmitting(false);
            setName('');
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showModal && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showModal && countdown <= 0) {
            triggerRedirect(false);
        }

        return () => clearInterval(interval);
    }, [showModal, countdown]);

    const handleManualRedirect = (e: React.MouseEvent) => {
        e.preventDefault();
        triggerRedirect(true);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col max-w-[520px] mx-auto w-full rounded-[18px] p-[1.6rem] md:p-[2rem_1rem] bg-[rgba(255,248,235,0.96)] border border-[rgba(190,150,95,0.6)] shadow-[0_12px_28px_rgba(0,0,0,0.18),inset_0_0_0_1px_rgba(255,255,255,0.4)]">
                <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting && showModal}
                    className="w-full max-w-[420px] mx-auto bg-[rgba(255,245,225,0.92)] border border-[rgba(190,150,95,0.55)] rounded-full px-[1.2rem] py-[0.9rem] mb-[1.2rem] text-center font-body text-[1rem] tracking-[0.05em] text-[#3b2a1a] focus:outline-none focus:border-[#d4af37] placeholder:text-[rgba(90,60,35,0.55)] placeholder:tracking-widest transition-colors"
                />

                <div className="relative w-full max-w-[420px] mx-auto mb-[1.2rem]">
                    <select
                        value={attendance}
                        onChange={(e) => setAttendance(e.target.value)}
                        disabled={isSubmitting && showModal}
                        className="w-full bg-[rgba(255,245,225,0.92)] border border-[rgba(190,150,95,0.55)] rounded-full px-[1.2rem] py-[0.9rem] text-center font-body text-[1rem] tracking-[0.05em] text-[#3b2a1a] focus:outline-none focus:border-[#d4af37] appearance-none transition-colors cursor-pointer"
                    >
                        <option value="yes">Joyfully Attending</option>
                        <option value="no">Regretfully Declining</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#6d4c2f]">
                        <svg className="h-4 w-4 fill-none stroke-current stroke-[1.5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6">
                            <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting && showModal}
                    className="inline-flex items-center justify-center font-heading text-[0.8rem] md:text-[1rem] tracking-[0.18em] uppercase whitespace-nowrap px-[2.6rem] py-[0.9rem] rounded-full mt-8 bg-[rgba(255,235,190,0.92)] text-[#4b2e1f] border border-[rgba(180,140,90,0.6)] hover:bg-[#ffe6af] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:-translate-y-[2px] transition-all duration-400 disabled:opacity-50 mx-auto"
                >
                    <Image src="/themes/royal-wedding/assets/images/whatsapp.png" alt="WhatsApp" width={16} height={16} className="object-contain mr-4 inline-block w-4 h-4" />
                    Confirm Presence
                </button>
            </form>

            {/* RSVP Success Modal - Rendered via Portal to escape GSAP contexts */}
            {showModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-[#1a0f0f]/90 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
                    <div className="w-full max-w-[420px] p-10 rounded-[18px] bg-[rgba(255,248,235,0.98)] border border-[rgba(190,150,95,0.6)] shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.4)] flex flex-col items-center text-center relative overflow-hidden text-[#3b2a1a]">

                        {/* Decorative background element */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>

                        <div className="w-16 h-16 rounded-full bg-[#d9fff2] flex items-center justify-center mb-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] border border-[rgba(190,150,95,0.2)]">
                            <Check className="text-[#3b2a1a] w-8 h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="font-heading tracking-widest text-3xl font-extralight text-[#3b2a1a] mb-4 uppercase">Thank You!</h2>

                        <p className="font-body text-[1.1rem] text-[#5a3a18] mb-8 leading-relaxed opacity-90">
                            Redirecting you to WhatsApp in <span className="font-bold text-[#d4af37] text-lg mx-1">{countdown}</span> seconds...
                        </p>

                        <button
                            onClick={handleManualRedirect}
                            className="w-full bg-[#25D366] text-white py-[0.9rem] flex items-center justify-center gap-3 uppercase tracking-widest font-heading text-[0.9rem] shadow-[0_5px_15px_rgba(37,211,102,0.3)] hover:bg-[#1ebd5a] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(37,211,102,0.4)] transition-all duration-300 rounded-full"
                        >
                            <Image src="/themes/royal-wedding/assets/images/whatsapp.png" alt="WhatsApp" width={18} height={18} className="object-contain brightness-0 invert" />
                            Open WhatsApp
                        </button>

                        <button
                            onClick={() => { setShowModal(false); setIsSubmitting(false); }}
                            className="mt-6 text-[0.8rem] font-body uppercase tracking-widest text-[#5a3a18]/60 hover:text-[#5a3a18] underline-offset-4 hover:underline transition-colors"
                        >
                            Cancel Redirect
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
