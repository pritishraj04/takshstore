import Link from "next/link";
import { LogOut, Home } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-primary font-inter w-full">
            {/* Minimal App Header */}
            <header className="h-16 border-b border-light bg-primary sticky top-0 z-50 px-6 flex items-center justify-between shrink-0">
                <Link href="/dashboard" className="font-playfair text-2xl tracking-tight text-secondary hover:opacity-70 transition-opacity">
                    Taksh.
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-black transition-colors px-4 py-2 hover:bg-light/30 rounded-md">
                        <Home size={14} strokeWidth={1.5} />
                        <span>Storefront</span>
                    </Link>
                    <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-black transition-colors px-4 py-2 hover:bg-light/30 rounded-md">
                        <LogOut size={14} strokeWidth={1.5} />
                        <span>Log Out</span>
                    </button>
                </div>
            </header>

            {/* App Content Area */}
            <main className="flex-1 w-full bg-white relative">
                {children}
            </main>
        </div>
    );
}
