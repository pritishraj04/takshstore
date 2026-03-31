"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";

interface CartTotalsProps {
  items: any[];
  discountAmount?: number;
  onCalculate?: (totals: any) => void;
}

export default function CartTotals({ items, discountAmount = 0, onCalculate }: CartTotalsProps) {
  const [totals, setTotals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTotals = async () => {
      if (items.length === 0) {
        setTotals(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await apiClient.post("/checkout/calculate", {
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        });
        setTotals(data);
        if (onCalculate) onCalculate(data);
      } catch (error) {
        console.error("Failed to calculate cart totals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotals();
  }, [items, onCalculate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!totals) return null;

  const { subtotal, shippingCharge, totalAmount, amountToFreeShipping, hasPhysicalItems, isDigitalOnly, freeShippingThreshold } = totals;
  const finalTotal = totalAmount - discountAmount;
  const threshold = freeShippingThreshold || 1500;

  return (
    <div className="space-y-6">
      {/* Threshold Upsell UI */}
      {hasPhysicalItems && (
        <div className="bg-white/50 border border-[#E5E4DF] p-4 rounded-lg">
          {amountToFreeShipping > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-2 text-[#1A1A1A]">
                  <Truck size={14} /> Shipping Progress
                </span>
                <span className="text-[#C5B39A]">₹{amountToFreeShipping} to go</span>
              </div>
              <div className="w-full bg-[#E5E4DF] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#1A1A1A] h-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#5A5A5A] italic">
                You are just <span className="font-bold text-[#1A1A1A]">₹{amountToFreeShipping.toLocaleString()}</span> away from <span className="text-emerald-700 font-bold">Complimentary Shipping</span>!
              </p>
            </div>
          ) : (
             <div className="flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-1 duration-500">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold tracking-tight">Your order qualifies for Complimentary Shipping.</span>
             </div>
          )}
        </div>
      )}

      {/* Totals Breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
          <span>Subtotal</span>
          <span className="text-[#1A1A1A] font-medium">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
          <span>Shipping</span>
          {isDigitalOnly ? (
            <span className="text-[#C5B39A] italic text-xs">Not Applicable</span>
          ) : shippingCharge === 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs line-through text-gray-300">₹100</span>
              <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Free</span>
            </div>
          ) : (
            <span className="text-[#1A1A1A] font-medium">₹{shippingCharge.toLocaleString()}</span>
          )}
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-sm text-[#5A5A5A]" style={{ fontFamily: 'var(--font-inter)' }}>
            <span>Discount Applied</span>
            <span className="text-emerald-700 font-semibold">-₹{discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="pt-4 border-t border-[#E5E4DF] flex justify-between items-end">
          <span className="text-xs uppercase tracking-widest text-[#1A1A1A] font-bold" style={{ fontFamily: 'var(--font-inter)' }}>
            Total
          </span>
          <span className="text-3xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>
            ₹{Math.max(0, finalTotal).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
