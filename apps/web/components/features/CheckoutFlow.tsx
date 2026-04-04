"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useCheckout } from "../../hooks/useCheckout";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiClient } from "../../lib/apiClient";
import { toast } from "sonner";
import CartTotals from "../checkout/CartTotals";
import TemplateRenderer from "../templates/TemplateRenderer";

export default function CheckoutFlow() {
    const { items, clearCollection } = useCollectionStore();
    const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
    const router = useRouter();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);


    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState('PERCENTAGE');

    const [calculatedTotals, setCalculatedTotals] = useState<any>(null);

    const handleCalculateTotals = useCallback((data: any) => {
        setCalculatedTotals(data);
    }, []);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

    // Prevent hydration errors with persisted state
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const getEffectivePrice = (item: any) => {
        let basePrice = (item.discountedPrice && Number(item.discountedPrice) > 0)
            ? Number(item.discountedPrice)
            : Number(item.price);
        if (item.isEternity && item.eternityAddonPrice) {
            basePrice += Number(item.eternityAddonPrice);
        }
        return basePrice;
    };

    const subtotal = calculatedTotals?.subtotal || items.reduce((total, item) => total + (getEffectivePrice(item) * Number(item.quantity)), 0) || 0;
    const shippingCost = calculatedTotals?.shippingCharge || 0;
    const calculatedDiscountAmount = discountType === 'PERCENTAGE'
        ? Math.round((subtotal * discountValue) / 100)
        : discountValue;
    const discountAmount = calculatedDiscountAmount || 0;
    const total = calculatedTotals?.totalAmount - discountAmount || 0;
    const requiresShipping = calculatedTotals?.hasPhysicalItems || items.some(item => item.type === 'PHYSICAL');

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
            setDiscountValue(data.discountValue);
            setDiscountType(data.discountType);
            setCouponSuccess(`Code applied! ${data.discountType === 'PERCENTAGE' ? `${data.discountValue}%` : `₹${data.discountValue}`} off`);
        } catch (err: any) {
            setCouponError(err.response?.data?.message || err.message || 'Invalid coupon or expired');
            setDiscountValue(0);
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
                                quantity: Number(item.quantity),
                                priceAtPurchase: getEffectivePrice(item),
                                type: item.type,
                                inviteData: item.type === 'DIGITAL' ? item.inviteData : undefined,
                                draftId: item.draftId,
                                isEternity: item.isEternity === true,
                                marriageDate: item.marriageDate,
                                templateKey: item.templateKey
                            })),
                            totalAmount: total,
                            subtotal: subtotal,
                            discountAmount: discountAmount,
                            couponCode: discountValue > 0 ? couponCode : undefined,
                            shippingCost: shippingCost,
                            shippingAddress: requiresShipping ? { name, address, city, postalCode } : undefined
                        }, {
                            onSuccess: (data: any) => {
                                console.log('2. Mutation Success, Data:', data);
                                setCheckoutError(null);
                                setIsProcessing(true);

                                if (data?.razorpayOrderId) {
                                    const script = document.createElement('script');
                                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                    script.onload = () => {
                                        const options = {
                                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                                            amount: data.amount,
                                            currency: data.currency,
                                            name: "Taksh Store",
                                            description: "Wedding Invitation & Canvas",
                                            order_id: data.razorpayOrderId,
                                            handler: async function (response: any) {
                                                toast.loading('Verifying your payment securely...', { id: 'payment-toast' });
                                                try {
                                                    await apiClient.post('/checkout/verify', {
                                                        razorpayPaymentId: response.razorpay_payment_id,
                                                        razorpayOrderId: response.razorpay_order_id,
                                                        razorpaySignature: response.razorpay_signature
                                                    });
                                                    toast.success('Payment successful! Your order is confirmed.', { id: 'payment-toast' });
                                                    clearCollection();
                                                    router.push(`/dashboard/orders/${data.orderId || data.id}`);
                                                } catch (err: any) {
                                                    setCheckoutError(err.response?.data?.message || 'Payment verification failed.');
                                                    toast.error('Payment verification failed. Please contact support.', { id: 'payment-toast' });
                                                    router.push(`/dashboard/orders/${data.orderId || data.id}`);
                                                }
                                            },
                                            prefill: { name: session?.user?.name || name, email: session?.user?.email || email, contact: '' },
                                            theme: { color: "#111827" },
                                            modal: {
                                                ondismiss: function () {
                                                    setIsProcessing(false);
                                                    toast.error('Payment was cancelled.');
                                                }
                                            }
                                        };
                                        const rzp = new (window as any).Razorpay(options);
                                        rzp.on('payment.failed', function (response: any) {
                                            setIsProcessing(false);
                                            setCheckoutError(response.error.description || 'Payment failed');
                                            toast.error(`Payment failed: ${response.error.description}`);
                                        });
                                        rzp.open();
                                    };
                                    document.body.appendChild(script);
                                } else {
                                    console.error('Missing razorpayOrderId in response');
                                    setIsProcessing(false);
                                    setCheckoutError('Payment details not received from server.');
                                    toast.error('Failed to initiate secure checkout. Please try again.');
                                }
                            },
                            onError: (err: any) => {
                                setCheckoutError(err.response?.data?.message || 'An error occurred during checkout. Please try again.');
                                toast.error('An error occurred during checkout.');
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
                        disabled={isCheckingOut || isProcessing}
                        className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-5 mt-4 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {isCheckingOut || isProcessing ? (
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
                            <div className="relative w-16 aspect-4/5 shrink-0 bg-[#FBFBF9] border border-[#E5E4DF] overflow-hidden">
                                {item.type === 'DIGITAL' && item.templateKey ? (
                                     <div className="scale-[0.1] origin-top-left w-[1000%] h-[1000%] pointer-events-none">
                                         <TemplateRenderer templateId={item.templateKey} data={item.inviteData} />
                                     </div>
                                ) : (
                                    <img
                                        src={item.imageUrl || '/assets/images/placeholder-product.jpg'}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                )}
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
                                {item.isEternity && (
                                    <p className="text-[9px] text-[#C5B39A] uppercase tracking-tighter mt-1 font-medium">
                                        + Eternity Hosting Included
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                {getEffectivePrice(item) < Number(item.price) ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs line-through text-gray-400" style={{ fontFamily: 'var(--font-inter)' }}>
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </span>
                                        <span className="text-sm text-[#1A1A1A] font-bold" style={{ fontFamily: 'var(--font-inter)' }}>
                                            ₹{(getEffectivePrice(item) * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <p
                                        className="text-sm text-[#1A1A1A]"
                                        style={{ fontFamily: 'var(--font-inter)' }}
                                    >
                                        ₹{(getEffectivePrice(item) * item.quantity).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Block */}
                <div className="mt-8 pt-8 border-t border-[#E5E4DF]">
                    <CartTotals 
                        items={items} 
                        discountAmount={discountAmount} 
                        onCalculate={handleCalculateTotals} 
                    />

                    {/* Promo Code Section */}
                    <div className="pt-8 border-t border-[#E5E4DF] mt-8">
                        <label className="block text-xs uppercase tracking-widest text-[#5A5A5A] mb-3 font-bold" style={{ fontFamily: 'var(--font-inter)' }}>
                            Promo Code
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={discountValue > 0 || isApplyingCoupon}
                                placeholder="Enter code"
                                className="flex-1 bg-transparent border border-[#E5E4DF] px-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            />
                            {discountValue > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCouponCode('');
                                        setDiscountValue(0);
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
                </div>

            </div>

        </div>
    );
}
