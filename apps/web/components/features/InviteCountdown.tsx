'use client';

import { useState, useEffect } from 'react';

interface InviteCountdownProps {
    targetDate: string; // ISO date string
}

export function InviteCountdown({ targetDate }: InviteCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        isToday: boolean;
        isPast: boolean;
    } | null>(null);

    useEffect(() => {
        function updateCountdown() {
            if (!targetDate) {
                setTimeLeft({ days: NaN, hours: NaN, minutes: NaN, isToday: false, isPast: false });
                return;
            }

            const oneDay = 24 * 60 * 60 * 1000;
            // Calculate one day prior to the actual target date for the countdown math, mimicking original logic
            const eventDate = new Date(targetDate).getTime() - oneDay;

            if (isNaN(eventDate)) {
                setTimeLeft({ days: NaN, hours: NaN, minutes: NaN, isToday: false, isPast: false });
                return;
            }

            const now = new Date().getTime();
            const diff = eventDate - now;

            // 🟢 EVENT IS TODAY
            if (diff <= 0 && diff > -oneDay) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, isToday: true, isPast: false });
                return;
            }

            // ⚪ EVENT IS IN THE PAST
            if (diff <= -86400000) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, isToday: false, isPast: true });
                return;
            }

            // 🔵 EVENT IS IN FUTURE
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);

            setTimeLeft({ days, hours, minutes: mins, isToday: false, isPast: false });
        }

        // Start countdown immediately
        updateCountdown();

        // Update every minute (60000ms)
        const intervalId = setInterval(updateCountdown, 60000);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [targetDate]);

    // Initial render state
    if (!timeLeft) {
        return (
            <div className="text-center mb-12">
                <p className="font-heading uppercase tracking-[0.2em] text-[#d4af37] text-[1.2rem] mb-2">The countdown begins</p>
                <div className="font-heading text-[3.5rem] text-white font-extralight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] opacity-0">
                    --<small className="text-[1.5rem] ml-1 uppercase">D</small>
                </div>
            </div>
        );
    }

    if (timeLeft.isToday) {
        return (
            <div className="text-center mb-12">
                <p className="font-heading uppercase tracking-[0.2em] text-[#d4af37] text-[1.2rem] mb-2">Together we celebrate</p>
                <h2 className="font-heading text-[2.5rem] text-white font-extralight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    ✨ Today is the day ✨
                </h2>
            </div>
        );
    }

    if (timeLeft.isPast) {
        return (
            <div className="text-center mb-12">
                <p className="font-heading uppercase tracking-[0.2em] text-[#d4af37] text-[1.2rem] mb-2">With blessings of the gods</p>
                <h2 className="font-heading text-[2.5rem] text-white font-extralight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    Forever begins here 💛
                </h2>
            </div>
        );
    }

    return (
        <div className="text-center mb-12">
            <p className="font-heading uppercase tracking-[0.2em] text-[#d4af37] text-[1.2rem] mb-2">The countdown begins</p>
            <h2 className="font-heading text-[3.5rem] text-white font-extralight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] flex items-end justify-center gap-2">
                <span className="flex items-baseline">
                    {isNaN(timeLeft.days) ? "--" : timeLeft.days}<small className="text-[1.5rem] ml-1 uppercase">D</small>
                </span>
                <span className="flex items-baseline">
                    {isNaN(timeLeft.hours) ? "--" : timeLeft.hours.toString().padStart(2, '0')}<small className="text-[1.5rem] ml-1 uppercase">H</small>
                </span>
                <span className="flex items-baseline">
                    {isNaN(timeLeft.minutes) ? "--" : timeLeft.minutes.toString().padStart(2, '0')}<small className="text-[1.5rem] ml-1 uppercase">M</small>
                </span>
            </h2>
        </div>
    );
}
