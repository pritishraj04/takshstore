'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { InviteData } from '@taksh/types';
import { InviteCountdown } from '../features/InviteCountdown';
import { AudioPlayer } from '../features/AudioPlayer';
import { RSVPForm } from '../features/RSVPForm';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface LiveInviteTemplateProps {
    data: any; // Mapped from window.weddingData JSON
    isPreviewMode?: boolean;
}

export function LiveInviteTemplate({ data, isPreviewMode = false }: LiveInviteTemplateProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);
    const lanternsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // 1. Scroll Indicator Fade
        const handleScroll = () => {
            if (scrollIndicatorRef.current) {
                const scrollY = isPreviewMode && containerRef.current ? containerRef.current.scrollTop : window.scrollY;
                if (scrollY > 50) {
                    scrollIndicatorRef.current.style.opacity = '0';
                } else {
                    scrollIndicatorRef.current.style.opacity = '1';
                }
            }
        };
        const scrollTarget = isPreviewMode ? containerRef.current : window;
        scrollTarget?.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        // 2. Lanterns Generation & Animation
        if (lanternsRef.current) {
            const container = lanternsRef.current;
            container.innerHTML = ''; // Clean up previous lanterns on re-render

            const lanternCount = 20;
            const lanterns: any[] = [];
            // Use container width to detect mobile mode so it respects the preview box width
            const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
            const isMobile = containerWidth < 768;

            for (let i = 0; i < lanternCount; i++) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("absolute");

                const img = document.createElement("img");
                img.src = "/assets/images/lantern.png";
                img.classList.add("w-full", "block");

                wrapper.appendChild(img);
                container.appendChild(wrapper);

                const minSize = isMobile ? 25 : 40;
                const maxSize = isMobile ? 60 : 120;
                const size = gsap.utils.random(minSize, maxSize);

                const xPos = Math.random() > 0.5
                    ? gsap.utils.random(-10, isMobile ? 15 : 30) // Left Zone
                    : gsap.utils.random(isMobile ? 85 : 70, 110); // Right Zone
                const yPos = gsap.utils.random(-10, 80);

                const normalizedDepth = (size - minSize) / (maxSize - minSize);
                const blur = (1 - normalizedDepth) * 4;
                const depth = normalizedDepth + 0.5;
                const duration = gsap.utils.random(3, 6);

                gsap.set(wrapper, {
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    width: size,
                    zIndex: Math.floor(depth * 10),
                });

                gsap.set(img, {
                    filter: `blur(${blur}px)`,
                });

                lanterns.push({ wrapper, depth });

                // Constant float
                gsap.to(img, {
                    y: -30,
                    x: gsap.utils.random(-20, 20),
                    rotation: gsap.utils.random(-5, 5),
                    duration: duration,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }

            // Scroll parallax for lanterns
            ScrollTrigger.create({
                trigger: "#hero",
                scroller: isPreviewMode ? containerRef.current : window,
                start: "top top",
                end: "bottom top",
                scrub: 0.5,
                onUpdate: (self) => {
                    lanterns.forEach((l) => {
                        const movement = self.progress * 400 * l.depth;
                        gsap.to(l.wrapper, {
                            y: -movement,
                            overwrite: "auto",
                        });
                    });
                },
            });
        }

        // Cleanup scroll listener
        return () => {
            scrollTarget?.removeEventListener("scroll", handleScroll);
        };
    }, { scope: containerRef, dependencies: [isPreviewMode] }); // Removed `data` from dependencies

    // Separate useGSAP for data-dependent elements (like fade-in sections)
    useGSAP(() => {
        if (!data || !containerRef.current) return;

        // 3. Fade In ScrollTrigger Sections
        const sections = [".fade-in-section"];
        sections.forEach((selector) => {
            gsap.utils.toArray(selector).forEach((el: any) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            scroller: isPreviewMode ? containerRef.current : window,
                            start: "top 80%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
        });
    }, { scope: containerRef, dependencies: [data, isPreviewMode] });

    if (!data) return null;

    const content = (
        <div ref={containerRef} className={`w-full max-w-[1200px] mx-auto overflow-x-hidden bg-[#1a0f0f] text-[#2c2c2c] ${isPreviewMode ? 'relative overflow-y-auto scrollbar-hide h-full' : 'relative min-h-screen'}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                @font-face {
                    font-family: "Bellefair";
                    src: url("/assets/fonts/Bellefair-Regular.ttf") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: "Lancelot";
                    src: url("/assets/fonts/Lancelot-Regular.ttf") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
                
                .font-heading { font-family: "Bellefair", serif; }
                .font-script { font-family: "Great Vibes", cursive; }
                .font-body { font-family: "Lancelot", sans-serif; }
                
                @keyframes bounceIndicator {
                    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                    40% { transform: translateX(-50%) translateY(-10px); }
                    60% { transform: translateX(-50%) translateY(-5px); }
                }
                .animate-bounce-custom {
                    animation: bounceIndicator 2s infinite;
                }
                
                @keyframes royalGlow {
                    0%, 100% { box-shadow: 0 28px 60px rgba(0,0,0,0.45), 0 0 40px rgba(215,180,120,0.25); }
                    50% { box-shadow: 0 28px 60px rgba(0,0,0,0.45), 0 0 60px rgba(215,180,120,0.45); }
                }
                .highlight-card {
                    animation: royalGlow 6s ease-in-out infinite;
                }
                @keyframes wave {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                .animate-wave {
                    animation: wave 2s linear infinite;
                }
                .lantern-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 5;
                    overflow: hidden;
                }
                .fade-in-section {
                    opacity: 0;
                    transform: translateY(50px);
                }
            `}} />

            {/* Scroll Indicator Wrapper */}
            <div className="absolute top-0 left-0 w-full h-svh pointer-events-none z-30">
                <div ref={scrollIndicatorRef} className="absolute bottom-[2dvh] left-1/2 opacity-100 transition-opacity duration-500 animate-bounce-custom flex flex-col items-center justify-center gap-2 text-white drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] pointer-events-none">
                    <div className="font-heading uppercase tracking-[0.15em] text-[0.9rem] font-normal">Swipe to scroll</div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[30px] h-[30px] stroke-white stroke-[1.5] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        <path d="M7 13L12 18L17 13M7 6L12 11L17 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* 1. HERO SECTION */}
            <section id="hero" className="relative w-full overflow-hidden min-h-auto p-0 m-0 block">
                <img src="/assets/images/bg-palace-full.webp" alt="Wedding Celebration" className="w-full h-auto min-h-[140svh] min-[380px]:min-h-[160svh] md:min-h-svh object-cover object-top block" />

                <div className="absolute inset-0 z-10 flex flex-col justify-between items-center pointer-events-none">
                    {/* Lanterns placeholder */}
                    <div id="lanterns-container" ref={lanternsRef} className="lantern-container absolute inset-0 pointer-events-none z-0 overflow-hidden"></div>

                    <div className="text-center relative z-20 w-full flex-1 flex flex-col justify-start pointer-events-auto mt-[7vh] md:mt-[10vh] px-4">
                        <p className="font-heading uppercase tracking-[0.2em] text-[0.8rem] md:text-[0.9rem] text-[#d4af37] mb-4">save the date</p>
                        <h1 className="font-heading text-[3rem] sm:text-[4rem] md:text-[5rem] font-extralight uppercase text-white drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] my-2 leading-none wrap-break-word">
                            {data?.couple?.bride?.name || "Bride"}
                        </h1>
                        <div className="font-script text-[1.5rem] md:text-[2rem] text-[#d4af37]">Weds</div>
                        <h1 className="font-heading text-[3rem] sm:text-[4rem] md:text-[5rem] font-extralight uppercase text-white drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] my-2 leading-none wrap-break-word">
                            {data?.couple?.groom?.name || "Groom"}
                        </h1>
                        <div className="mt-8">
                            <span className="font-heading text-[1.2rem] md:text-[1.4rem] tracking-[0.15em] text-[#f3ecba] border-y border-[#d4af37] px-8 py-2 inline-block">
                                {data?.wedding?.displayDate || "TBA"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 
            tailwind for @media (min-width: 380px) {
                #invite {
                    height: 60rem;
                }
            } */}

            {/* 2. SEGUE SECTION */}
            <section id="invite" className="relative w-full min-h-auto p-0 m-0 block -mt-px h-220 md:h-260">
                <img src="/assets/images/bg-palace-segue.png" alt="Invitation" className="w-full h-auto min-h-[140svh] min-[380px]:min-h-[160svh] md:min-h-svh object-cover object-top block" />

                <div className="absolute inset-0 z-10 flex justify-center items-start pt-[5vh] pb-0 pointer-events-none">
                    <div className="px-12 max-w-[700px] text-center opacity-100 pointer-events-auto fade-in-section">
                        <img src="/assets/images/lord.png" alt="Decoration" className="block w-full max-w-[120px] h-auto mx-auto mb-10" />
                        <p className="font-body text-base md:text-[1rem] text-[#f3ecba] mb-6">
                            {data?.messages?.inviteText || "With joyful hearts, we invite you to share in our happiness..."}
                        </p>
                        <div className="w-12 h-px bg-[#f3ecba] mx-auto mb-6"></div>

                        <p className="font-body text-[1.2rem] text-[#f3ecba] mb-2">From the hearts of Bride's parents</p>
                        <p className="font-body text-[1.7em] text-[#f3ecba] font-bold mb-6 leading-none inline-block">
                            {data?.couple?.bride?.parents?.mother || ""}<br />&amp;<br />{data?.couple?.bride?.parents?.father || ""}
                        </p>

                        <h2 className="font-heading text-[2rem] md:text-[3rem] text-[#d9fff2] font-extralight uppercase tracking-widest mb-6 leading-tight wrap-break-word">
                            {data?.couple?.bride?.name}<br />&amp;<br />{data?.couple?.groom?.name}
                        </h2>

                        <p className="font-body text-[1.2rem] text-[#f3ecba] mb-2">From the hearts of Groom's parents</p>
                        <p className="font-body text-[1.7em] text-[#f3ecba] font-bold mb-6 leading-none inline-block">
                            {data?.couple?.groom?.parents?.mother || ""}<br />&amp;<br />{data?.couple?.groom?.parents?.father || ""}
                        </p>
                    </div>
                </div>

                <div className="absolute -bottom-20 left-0 w-full flex justify-center py-8 z-20">
                    <img src="/assets/images/divider.png" alt="Section Divider" className="w-full h-auto block" />
                </div>
            </section>

            {/* 3. PATHWAY SCENE */}
            <div className="relative w-full bg-[url('/assets/images/bg-pathway-tile.png')] bg-repeat-y bg-top bg-size-[100%_auto] -mt-px pb-16">

                {/* Events Section */}
                <section id="events" className="relative p-8 flex flex-col items-center justify-center min-h-auto">
                    <div className="w-full max-w-[1200px] mx-auto text-center relative z-10">
                        <h2 className="font-heading text-[2.5rem] md:text-[3.5rem] text-[#d9fff2] mb-8 mt-20 font-extralight uppercase tracking-widest inline-block relative">The Celebrations</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-[1100px] mx-auto">
                            {(data?.celebrations || []).map((ev: any, i: number) => (
                                <div key={i} className={`fade-in-section relative rounded-[18px] p-[1.6rem] bg-[rgba(255,248,235,0.96)] border border-[rgba(190,150,95,0.6)] shadow-[0_12px_28px_rgba(0,0,0,0.18),inset_0_0_0_1px_rgba(255,255,255,0.4)] w-full max-w-[320px] mx-auto text-center font-body text-[#3b2a1a] ${ev.highlight ? 'highlight-card' : ''}`}>
                                    <h3 className="font-heading text-[1.6rem] font-extralight tracking-[0.15em] mb-[0.6rem] before:content-['✦'] before:block before:text-[1.2rem] before:mb-[0.4rem] before:text-[rgba(190,150,95,0.9)] after:content-[''] after:block after:w-[40px] after:h-1px after:bg-[rgba(190,150,95,0.7)] after:my-[0.6rem] after:mx-auto text-[#3b2a1a] wrap-break-word">
                                        <b>{ev.name}</b>
                                    </h3>
                                    <div className="w-12 h-px bg-[#be965fb3] mx-auto mb-2"></div>
                                    <p className="text-[1.3rem] my-[0.3rem] tracking-[0.08em] font-bold text-[rgba(60,40,20,0.85)]"><b>{ev.date}</b></p>
                                    <p className="text-[1rem] my-[0.3rem] tracking-[0.08em] opacity-85 text-[rgba(60,40,20,0.85)]">{ev.time}</p>
                                    <p className="text-[1rem] my-[0.3rem] tracking-[0.08em] opacity-90 italic text-[rgba(60,40,20,0.85)]">{ev.venue}</p>
                                    <p className="mt-2 text-[0.8rem] uppercase tracking-widest opacity-80 text-[#5a3a18]">Dress Code: {ev.dressCode}</p>
                                    {ev.calendarUrl && (
                                        <a href={ev.calendarUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => isPreviewMode && e.preventDefault()} className="inline-flex items-center justify-center font-heading text-[0.9rem] tracking-widest uppercase whitespace-nowrap px-6 py-[0.6rem] rounded-full mt-4 bg-[rgba(255,235,190,0.4)] text-[#4b2e1f] border border-[rgba(180,140,90,0.4)] hover:bg-[rgba(255,230,175,0.8)] hover:text-[#2c1a10] hover:-translate-y-[2px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">Add to Calendar</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="w-full flex justify-center py-8">
                    <img src="/assets/images/divider.png" alt="Decorative Divider" className="w-full h-auto block" />
                </div>

                {/* Route Section */}
                {(data?.celebrations || []).some((ev: any) => ev.showLocation) && (
                    <>
                        <section id="route" className="relative p-8 flex flex-col items-center justify-center min-h-auto">
                            <div className="w-full max-w-[1200px] mx-auto text-center relative z-10">
                                <h2 className="font-heading text-[2.5rem] md:text-[3.5rem] text-[#d9fff2] mb-8 font-extralight uppercase tracking-widest inline-block relative">See The Route</h2>

                                <div className="flex flex-col md:flex-row gap-12 justify-center items-center px-4 w-full">
                                    {(data?.celebrations || []).filter((ev: any) => ev.showLocation).map((ev: any, i: number, arr: any[]) => (
                                        <div key={i} className="flex flex-col items-center w-full md:w-auto relative">
                                            <div className="flex flex-col items-center fade-in-section w-full">
                                                <div className="relative w-full max-w-[520px] mx-auto text-center mb-8">
                                                    <img src={ev.mapImage ? `/${ev.mapImage}` : "/assets/images/map.png"} alt="Map" className="w-full h-auto rounded-[18px] bg-[#fff3db] p-[14px] border border-[rgba(190,150,95,0.6)] shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.4)]" />
                                                </div>

                                                <h4 className="font-heading text-[1.5rem] md:text-[2rem] text-[#f4e4bc] mt-4 mb-2 text-center tracking-[0.15em] uppercase font-extralight">{ev.name}</h4>
                                                <p className="text-[1.2rem] md:text-[1.5rem] text-[rgba(243,236,186,0.8)] font-body text-center -mt-2">{ev.venue}</p>

                                                {ev.googleMapsUrl && (
                                                    <a href={ev.googleMapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => isPreviewMode && e.preventDefault()} className="inline-flex items-center justify-center font-heading text-[1rem] tracking-[0.18em] uppercase whitespace-nowrap px-[2.6rem] py-[0.9rem] rounded-full mt-8 bg-[rgba(255,235,190,0.92)] text-[#4b2e1f] border border-[rgba(180,140,90,0.6)] hover:bg-[#ffe6af] hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-all duration-400">Get Directions</a>
                                                )}
                                            </div>

                                            {/* Vertical divider between items (hidden on last item, horizontal on mobile) */}
                                            {i < arr.length - 1 && (
                                                <div className="w-[60%] h-px md:w-px md:h-full md:absolute md:-right-6 md:top-0 bg-[rgba(255,255,255,0.4)] mt-12 md:mt-0"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div className="w-full flex justify-center py-8">
                            <img src="/assets/images/divider.png" alt="Decorative Divider" className="w-full h-auto block" />
                        </div>
                    </>
                )}

                {/* Couple Section */}
                <section id="couple" className="relative p-8 flex flex-col items-center justify-center min-h-auto">
                    <div className="w-full max-w-[1200px] mx-auto text-center relative z-10 fade-in-section">
                        <h2 className="font-heading text-[2.5rem] md:text-[3.5rem] text-[#d9fff2] mb-8 font-extralight uppercase tracking-widest inline-block relative">The Happy Couple</h2>
                        <div className="flex justify-center my-8 md:my-12 mx-0 relative z-10 px-4">
                            <div className="relative p-[14px] rounded-[22px] bg-linear-to-br from-[rgba(215,180,120,0.9)] to-[rgba(150,110,60,0.9)] shadow-[0_20px_40px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.3)] 
                                            after:content-[''] after:absolute after:-inset-[25px] after:bg-[radial-gradient(circle,rgba(215,180,120,0.15),transparent_70%)] after:-z-10 w-full max-w-[320px] mx-auto">
                                <img src={data?.couple?.image || "/assets/images/couple.png"} alt="Couple" className="block w-full h-auto rounded-[18px] border border-[rgba(255,255,255,0.45)] bg-[#fff8ec]" />
                            </div>
                        </div>
                        <p className="mt-[1.6rem] font-body italic text-[1.2rem] tracking-[0.08em] text-[rgba(243,230,200,0.75)] mb-2 text-center">{data?.messages?.coupleQuote || "Two souls, one heart."}</p>
                    </div>
                </section>

                <div className="w-full flex justify-center py-8">
                    <img src="/assets/images/divider.png" alt="Decorative Divider" className="w-full h-auto block" />
                </div>

                {/* RSVP Placeholder Grid (Phase 4) */}
                <section id="rsvp" className="relative p-8 flex flex-col items-center justify-center min-h-auto">
                    <div className="w-full max-w-[1200px] mx-auto text-center relative z-10 fade-in-section">
                        <h2 className="font-heading text-[2.5rem] md:text-[3.5rem] text-[#d9fff2] mb-8 font-extralight uppercase tracking-widest inline-block relative">Please RSVP</h2>
                        <RSVPForm
                            targetNumber={data?.contact?.whatsapp}
                            brideName={data?.couple?.bride?.name}
                            groomName={data?.couple?.groom?.name}
                        />
                    </div>
                </section>

            </div>

            {/* 4. FOOTER */}
            <footer id="footer" className="relative flex flex-col w-full bg-none min-h-auto items-center">
                <div className="w-full max-w-[980px] mx-auto relative bg-[#1a0f0f]">
                    <div className="relative w-full bg-[#1a0f0f] min-h-[960px]">
                        <img src="/assets/images/footer.png" alt="Royal Footer" className="absolute top-0 left-0 w-full h-full object-cover object-bottom z-0 opacity-100" />

                        <div className="relative w-full min-h-full flex flex-col justify-center items-center z-10 px-8 pt-24 pb-16">

                            {/* Countdown Component (Phase 2) */}
                            <InviteCountdown targetDate={data?.wedding?.date || data?.wedding?.displayDate} />

                            <h2 className="font-script text-[#f4e4bc] text-[2.5rem] md:text-[3rem] font-normal mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] text-center tracking-[0.05em]">{data?.couple?.bride?.name} &amp; {data?.couple?.groom?.name}</h2>
                            <p className="font-body text-[#f3ecba] text-[0.9rem] mb-4 drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]">{data?.messages?.thankYou || "Thank you for being part of our journey."}</p>
                            <p className="font-body text-[#d9fff2] font-bold text-[1.2rem] mb-8 tracking-[1px]">{data?.couple?.hashtag}</p>

                            <div className="flex justify-center gap-16 flex-wrap w-full mt-4 text-left">
                                <div className="flex flex-col gap-[0.8rem] min-w-[150px]">
                                    <h3 className="font-body text-[1.3rem] font-bold text-white uppercase mb-2 border-b border-[#d4af37] pb-2 inline-block w-fit">Links</h3>
                                    <a href="#route" className="font-body text-[1.1rem] text-[#f3ecba] no-underline hover:text-[#d4af37] transition-colors">Venue location</a>
                                    <a href="#rsvp" className="font-body text-[1.1rem] text-[#f3ecba] no-underline hover:text-[#d4af37] transition-colors">RSVP</a>
                                </div>
                                <div className="flex flex-col gap-[0.8rem] min-w-[150px]">
                                    <h3 className="font-body text-[1.3rem] font-bold text-white uppercase mb-2 border-b border-[#d4af37] pb-2 inline-block w-fit">Navigation</h3>
                                    <a href="#invite" className="font-body text-[1.1rem] text-[#f3ecba] no-underline hover:text-[#d4af37] transition-colors">The invite</a>
                                    <a href="#couple" className="font-body text-[1.1rem] text-[#f3ecba] no-underline hover:text-[#d4af37] transition-colors">Bride and Groom</a>
                                    <a href="#events" className="font-body text-[1.1rem] text-[#f3ecba] no-underline hover:text-[#d4af37] transition-colors">Things to know</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <AudioPlayer audioSrc={data?.music?.url || '/assets/music/music.mp3'} autoPlay={data?.music?.autoplay ?? true} isPreviewMode={isPreviewMode} />
        </div>
    );

    if (isPreviewMode) return content;

    return (
        <div className="min-h-screen w-full bg-[#1a0f0f]">
            {content}
        </div>
    );
}
