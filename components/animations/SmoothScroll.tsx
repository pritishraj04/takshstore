"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export default function SmoothScroll({ children }: { children: ReactNode }) {
    // Configured to mimic a heavy, luxurious, ethereal scroll
    // smoothWheel: true enables smooth scrolling for mouse wheels
    // duration: 1.5 increases the time it takes to stop
    // lerp: 0.05 creates a very soft and trailing interpolation
    return (
        <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
            {children}
        </ReactLenis>
    );
}
