"use client";

import { useState } from "react";
import { Gift, Check } from "lucide-react";

export default function SpecialOffers() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("FOREVER20");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="bg-primary text-primary-foreground py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 relative">
          <Gift className="w-8 h-8" />
          <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            NEW
          </span>
        </div>
        
        <h2 className="font-serif text-4xl md:text-5xl mb-6">Spring Wedding Season Special</h2>
        <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Celebrate your love story with elegant digital invitations. Get 20% off your entire digital suite for a limited time.
        </p>
        
        <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 transition-all">
          <span className="px-6 py-3 font-mono text-xl tracking-wider font-bold">FOREVER20</span>
          <button 
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              copied ? "bg-green-500 text-white" : "bg-white text-primary hover:bg-neutral-100"
            }`}
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" /> Copied!
              </>
            ) : (
              "Copy Code"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

