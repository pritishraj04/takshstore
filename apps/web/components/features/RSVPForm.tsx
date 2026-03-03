'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

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

        setWhatsappWebUrl(webUrl);
        setShowModal(true);
        setCountdown(5);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showModal && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showModal && countdown <= 0) {
            // Auto redirect when countdown finishes
            window.location.href = whatsappWebUrl;
        }

        return () => clearInterval(interval);
    }, [showModal, countdown, whatsappWebUrl]);

    const handleManualRedirect = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(whatsappWebUrl, '_blank');
        setShowModal(false);
        setIsSubmitting(false);
        setName(''); // Reset form
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
                    className="inline-flex items-center justify-center font-heading text-[1rem] tracking-[0.18em] uppercase whitespace-nowrap px-[2.6rem] py-[0.9rem] rounded-full mt-8 bg-[rgba(255,235,190,0.92)] text-[#4b2e1f] border border-[rgba(180,140,90,0.6)] hover:bg-[#ffe6af] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:-translate-y-[2px] transition-all duration-400 disabled:opacity-50 mx-auto"
                >
                    <Image src="/assets/images/whatsapp.png" alt="WhatsApp" width={16} height={16} className="object-contain mr-4 inline-block w-4 h-4" />
                    Confirm Presence
                </button>
            </form>

            {/* RSVP Success Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1a0f0f]/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#fcfbf9] w-full max-w-md p-8 rounded-[18px] border border-[#d4af37]/30 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">

                        {/* Decorative background element */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>

                        <div className="w-16 h-16 rounded-full bg-[#d9fff2] flex items-center justify-center mb-6">
                            <Check className="text-[#1a0f0f] w-8 h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="font-heading text-3xl font-extralight text-[#1a0f0f] mb-4">Thank You!</h2>

                        <p className="font-body text-[#1a0f0f]/80 mb-6 leading-relaxed">
                            We have received your response. Redirecting you to WhatsApp to send the message in <span className="font-bold text-[#d4af37] text-lg mx-1">{countdown}</span> seconds...
                        </p>

                        <button
                            onClick={handleManualRedirect}
                            className="w-full bg-[#25D366] text-white py-3 flex items-center justify-center gap-2 uppercase tracking-widest font-heading text-sm shadow-lg hover:bg-[#1ebd5a] transition-colors rounded-full"
                        >
                            <Image src="/assets/images/whatsapp.png" alt="WhatsApp" width={16} height={16} className="object-contain brightness-0 invert" />
                            Open WhatsApp Now
                        </button>

                        <button
                            onClick={() => { setShowModal(false); setIsSubmitting(false); }}
                            className="mt-4 text-xs font-body uppercase tracking-wider text-[#1a0f0f]/50 hover:text-[#1a0f0f] underline-offset-4 hover:underline"
                        >
                            Cancel Redirect
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
