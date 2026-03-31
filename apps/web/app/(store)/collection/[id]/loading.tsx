import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBF9]" style={{ fontFamily: 'var(--font-playfair)' }}>
            <Loader2 size={40} className="animate-spin text-[#1A1A1A] mb-4" strokeWidth={1} />
            <p className="text-xs uppercase tracking-[0.3em] text-[#5A5A5A] animate-pulse">
                Curating your selection...
            </p>
        </main>
    );
}
