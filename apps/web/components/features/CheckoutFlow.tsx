"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useCheckout } from "../../hooks/useCheckout";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiClient } from "../../lib/apiClient";

export default function CheckoutFlow() {
    const { items, clearCollection } = useCollectionStore();
    const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
    const router = useRouter();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discountPct, setDiscountPct] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

    // Prevent hydration errors with persisted state
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const requiresShipping = items.some(item => item.type === 'PHYSICAL');
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = Math.round((subtotal * discountPct) / 100);
    const shippingCost = requiresShipping ? 150 : 0; // Flat luxury shipping rate or free
    const total = subtotal - discountAmount + shippingCost;

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FBFBF9] text-center px-6">
                <h2
                    className="text-4xl text-[#1A1A1A] mb-6"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Your cart is empty
                </h2>
                <Link
                    href="/collection"
                    className="relative group text-xs uppercase tracking-widest text-[#1A1A1A] py-2 border-b border-[#E5E4DF] overflow-hidden inline-block"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <span className="relative z-10 transition-colors duration-500">RETURN TO GALLERY</span>
                    <span className="absolute left-0 bottom-0 w-full h-px bg-[#1A1A1A] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0" />
                </Link>
            </div>
        );
    }

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError(null);
        setCouponSuccess(null);
        try {
            const { data } = await apiClient.get(`/coupons/validate/${couponCode}`);
            setDiscountPct(data.discountPercentage);
            setCouponSuccess(`Code applied! ${data.discountPercentage}% off`);
        } catch (err: any) {
            setCouponError(err.response?.data?.message || err.message || 'Invalid coupon or expired');
            setDiscountPct(0);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] grid grid-cols-1 lg:grid-cols-2">

            {/* Left Column (The Form) */}
            <div className="p-8 md:p-16 lg:px-24 flex flex-col justify-start lg:justify-center pt-32 lg:pt-16">
                <h1
                    className="text-4xl text-[#1A1A1A] mb-12 tracking-tight"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Secure Checkout
                </h1>

                <form
                    className="w-full max-w-lg flex flex-col"
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('1. Button Clicked, Session:', session);
                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email') as string;
                        const name = formData.get('name') as string;
                        const address = formData.get('address') as string;
                        const city = formData.get('city') as string;
                        const postalCode = formData.get('postalCode') as string;

                        if (!session) {
                            router.push('/login?callbackUrl=/checkout');
                            return;
                        }

                        checkout({
                            items: items.map(item => ({
                                productId: item.id,
                                quantity: item.quantity,
                                priceAtPurchase: item.price,
                                type: item.type,
                                inviteData: item.type === 'DIGITAL'
                                    ? item.inviteData
                                    : undefined,
                                draftId: item.draftId
                            })),
                            totalAmount: total,
                            shippingAddress: requiresShipping ? { address, city, postalCode } : undefined
                        }, {
                            onSuccess: (data: any) => {
                                console.log('2. Mutation Success, Data:', data);
                                setCheckoutError(null);
                                // Once order is created in DB, redirect to PhonePe
                                if (data?.redirectUrl) {
                                    window.location.href = data.redirectUrl;
                                } else {
                                    console.error('Missing redirectUrl in response');
                                    setCheckoutError('Payment URL not received from server.');
                                }
                            },
                            onError: (err: any) => {
                                setCheckoutError(err.response?.data?.message || 'An error occurred during checkout. Please try again.');
                            }
                        });
                    }}
                >

                    {/* Section 1 - Contact */}
                    <div className="mb-12">
                        <h3
                            className="text-xs uppercase tracking-widest text-[#5A5A5A] mb-8"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            01. Contact Details
                        </h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 mb-8 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                            required
                        />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 mb-8 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            style={{ fontFamily: 'var(--font-inter)' }}
                            required
                        />
                    </div>

                    {/* Section 2 - Shipping (Conditional) */}
                    <div className="mb-12">
                        <h3
                            className="text-xs uppercase tracking-widest text-[#5A5A5A] mb-8 flex justify-between items-center"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span>02. Delivery</span>
                            {!requiresShipping && <span className="text-[#C5B39A] italic lowercase">Digital Only</span>}
                        </h3>

                        {requiresShipping ? (
                            <>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Street Address"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 mb-8 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="Postal Code"
                                        className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                        required
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Phone Number (for courier)"
                                    className="w-full bg-transparent border-b border-[#E5E4DF] pb-3 text-sm placeholder:text-[#5A5A5A] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                    required
                                />
                            </>
                        ) : (
                            <p
                                className="text-sm italic text-[#5A5A5A] pb-3 border-b border-[#E5E4DF]"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                No physical shipping required. Assets will be delivered securely via email.
                            </p>
                        )}
                    </div>

                    {/* Section 3 - Payment */}
                    <div>
                        <h3
                            className="text-xs uppercase tracking-widest text-[#5A5A5A] mb-8"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            03. Payment
                        </h3>
                        <div
                            className="w-full h-32 border border-[#E5E4DF] flex items-center justify-center text-xs tracking-widest text-[#5A5A5A] uppercase bg-[#FBFBF9]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            SECURE PAYMENT GATEWAY
                        </div>
                    </div>

                    {checkoutError && (
                        <div className="mb-6 p-4 border border-red-800 bg-red-900/10 rounded-sm">
                            <p className="text-red-700 text-sm mb-3 font-medium">
                                {checkoutError}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    clearCollection();
                                    setCheckoutError(null);
                                }}
                                className="text-xs tracking-widest uppercase text-red-900 font-semibold hover:text-red-700 underline underline-offset-4"
                            >
                                Clear Invalid Items
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isCheckingOut}
                        className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 mt-4 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {isCheckingOut ? (
                            <><Loader2 size={14} className="mr-2 animate-spin" strokeWidth={1.5} /> PROCESSING...</>
                        ) : (
                            <><Lock size={14} className="mr-2" strokeWidth={1.5} /> COMPLETE PURCHASE</>
                        )}
                    </button>
                </form>
            </div>

            {/* Right Column (Order Summary) */}
            <div className="bg-[#F2F1EC] p-8 md:p-16 lg:px-24 border-t lg:border-t-0 lg:border-l border-[#E5E4DF] flex flex-col justify-start lg:justify-center">

                <h3
                    className="text-2xl text-[#1A1A1A] mb-12 tracking-tight"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Order Summary
                </h3>

                <div className="flex flex-col gap-8 flex-1 overflow-y-auto max-h-[50vh] pr-4">
                    {items.map(item => (
                        <div key={item.id} className="flex gap-6 items-center">
                            <div className="relative w-16 aspect-4/5 shrink-0 bg-[#FBFBF9] border border-[#E5E4DF]">
                                <Image
                                    src={item.imageUrl || "https://images.unsplash.com/photo-1544078755-9a8492027b1f"}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <h4
                                    className="text-lg text-[#1A1A1A]"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    {item.title}
                                </h4>
                                <p
                                    className="text-[10px] uppercase tracking-widest text-[#5A5A5A] mt-1"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    {item.type} {item.quantity > 1 && `(x${item.quantity})`}
                                </p>
                            </div>
                            <p
                                className="text-sm text-[#1A1A1A]"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Totals Block */}
                <div className="mt-8 pt-8 border-t border-[#E5E4DF] flex flex-col gap-4">
                    <div
                        className="flex justify-between items-center text-sm text-[#5A5A5A]"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div
                        className="flex justify-between items-center text-sm text-[#5A5A5A]"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        <span>Shipping</span>
                        <span>{shippingCost === 0 ? 'Complimentary' : `₹${shippingCost}`}</span>
                    </div>

                    {/* Promo Code Section */}
                    <div className="pt-4 border-t border-[#E5E4DF]">
                        <label className="block text-xs uppercase tracking-widest text-[#5A5A5A] mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                            Promo Code
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={discountPct > 0 || isApplyingCoupon}
                                placeholder="Enter code"
                                className="flex-1 bg-transparent border border-[#E5E4DF] px-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            />
                            {discountPct > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCouponCode('');
                                        setDiscountPct(0);
                                        setCouponSuccess(null);
                                    }}
                                    className="px-6 bg-[#1A1A1A] text-[#FBFBF9] text-xs uppercase tracking-widest hover:bg-black transition-colors"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    Remove
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={applyCoupon}
                                    disabled={!couponCode.trim() || isApplyingCoupon}
                                    className="px-6 bg-[#1A1A1A] text-[#FBFBF9] text-xs uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                    style={{ fontFamily: 'var(--font-inter)' }}
                                >
                                    {isApplyingCoupon ? '...' : 'Apply'}
                                </button>
                            )}
                        </div>
                        {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
                        {couponSuccess && <p className="text-green-600 text-xs mt-2">{couponSuccess}</p>}
                    </div>

                    {discountPct > 0 && (
                        <div
                            className="flex justify-between items-center text-sm text-[#5A5A5A] mt-2"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span>Discount ({discountPct}%)</span>
                            <span className="text-green-700">-₹{discountAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div
                        className="flex justify-between items-end mt-4 pt-4 border-t border-[#E5E4DF]"
                    >
                        <span
                            className="text-xs uppercase tracking-widest text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            Total
                        </span>
                        <span
                            className="text-2xl text-[#1A1A1A]"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            ₹{total.toLocaleString()}
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
}
