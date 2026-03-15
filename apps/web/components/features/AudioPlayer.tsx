'use client';

import { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';

interface AudioPlayerProps {
    audioSrc: string;
    autoPlay?: boolean;
    isPreviewMode?: boolean;
}

export function AudioPlayer({ audioSrc, autoPlay = true, isPreviewMode = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        if (!audioSrc) return;

        // Initialize audio object only on client side
        if (!audioRef.current) {
            const audio = new Audio(audioSrc);
            audio.loop = true;
            audioRef.current = audio;
        }

        const audio = audioRef.current;

        const attemptPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                console.log("Autoplay blocked. Waiting for user interaction.", err);
                setIsPlaying(false);

                // Add one-time listener to document to unlock audio on first interaction
                const unlock = async () => {
                    if (isPreviewMode) return; // Never unlock if in preview mode
                    try {
                        await audio.play();
                        setIsPlaying(true);
                        setHasInteracted(true);
                        document.removeEventListener('click', unlock);
                        document.removeEventListener('touchstart', unlock);
                    } catch (e) {
                        console.error("Playback failed after interaction:", e);
                    }
                };

                if (!hasInteracted && !isPreviewMode) {
                    document.addEventListener('click', unlock, { once: true });
                    document.addEventListener('touchstart', unlock, { once: true });
                }
            }
        };

        // HARD LOCK: Never autoplay in the Customizer preview iframe
        if (isPreviewMode) {
            audio.muted = true;
            audio.pause();
            setIsPlaying(false);
            return;
        } else {
            audio.muted = false;
        }

        if (autoPlay) {
            attemptPlay();
        }

        // Cleanup
        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, [audioSrc, autoPlay, hasInteracted, isPreviewMode]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => {
                setIsPlaying(true);
                setHasInteracted(true);
            }).catch(e => console.error("Playback failed:", e));
        }
    };

    if (!audioSrc) return null;

    return (
        <button
            onClick={togglePlay}
            className={`fixed bottom-[20px] right-[20px] z-1000 w-[50px] h-[50px] rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 focus:outline-none ${isPlaying
                ? 'bg-[#f4e4bc] text-[#800020] border border-[#800020] shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                : 'bg-[rgba(255,255,255,0.9)] text-[#2c2c2c] border border-[#d4af37] shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:scale-110 hover:bg-white hover:shadow-[0_6px_12px_rgba(212,175,55,0.3)]'
                }`}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
        >
            <div className={`relative z-10 transition-transform duration-300 ${isPlaying ? 'scale-90' : 'scale-100'}`}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
            </div>

            {/* Animated waves when playing */}
            {isPlaying && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none opacity-100 transition-opacity duration-300">
                    <span className="absolute box-border border border-[#d4af37] rounded-full animate-wave opacity-0 w-[30px] h-[30px]" />
                    <span className="absolute box-border border border-[#d4af37] rounded-full animate-wave opacity-0 w-[40px] h-[40px]" style={{ animationDelay: '0.6s' }} />
                    <span className="absolute box-border border border-[#d4af37] rounded-full animate-wave opacity-0 w-[50px] h-[50px]" style={{ animationDelay: '1.2s' }} />
                </div>
            )}
        </button>
    );
}
