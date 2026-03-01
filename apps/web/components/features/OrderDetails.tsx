"use client";

import { useRef } from "react";
import Link from "next/link";
import { useOrder } from "../../hooks/useOrder";
import { useRetryPayment } from "../../hooks/useRetryPayment";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Info, AlertCircle } from "lucide-react";
import { ProductType } from "@taksh/types";

// Types matching the Prisma backend
enum InviteStatus {
    DRAFT = "DRAFT",
    DEVELOPMENT = "DEVELOPMENT",
    PUBLISHED = "PUBLISHED",
}

enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    COMPLETED = "COMPLETED",
}

interface DigitalInvite {
    id: string;
    status: InviteStatus;
    websiteUrl: string | null;
}

interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: number;
    product: {
        title: string;
        type: ProductType;
    };
    digitalInvite: DigitalInvite | null;
}

interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
}

export default function OrderDetails({ orderId }: { orderId: string }) {
    const container = useRef<HTMLDivElement>(null);
    const { data: order, isLoading, isError } = useOrder(orderId) as { data: Order, isLoading: boolean, isError: boolean };
    const { mutate: retryPayment, isPending: isRetrying } = useRetryPayment();

    useGSAP(() => {
        if (!isLoading && order) {
            gsap.fromTo(
                ".order-animate",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power2.out" }
            );
        }
    }, [isLoading, order]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center font-playfair text-2xl text-primary tracking-widest uppercase">
                Retrieving Order Archives...
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-center px-6">
                <h2 className="font-playfair text-3xl text-primary tracking-wide mb-6">
                    Order not found or unauthorized access.
                </h2>
                <Link
                    href="/dashboard"
                    className="font-inter text-xs tracking-widest uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#C5B39A] hover:border-[#C5B39A] transition-colors"
                >
                    Return to Atelier
                </Link>
            </div>
        );
    }

    return (
        <div ref={container} className="pt-40 pb-32 px-6 md:px-16 lg:px-32 bg-primary min-h-screen print:bg-white print:text-black">
            <div className="max-w-4xl mx-auto">

                {/* Print-Only Official Brand Logo */}
                <div className="hidden print:block mb-12 border-b border-gray-200 pb-8">
                    <h2 className="text-3xl tracking-wide uppercase text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Taksh Store
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2" style={{ fontFamily: 'var(--font-inter)' }}>
                        Official Receipt
                    </p>
                </div>

                {/* Header */}
                <div className="order-animate mb-16">
                    <Link
                        href="/dashboard"
                        className="font-inter text-xs tracking-widest uppercase text-secondary hover:text-primary transition-colors mb-12 block print:hidden"
                    >
                        ← BACK TO ATELIER
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-playfair text-5xl md:text-6xl text-primary tracking-wide mb-4">
                                Order Summary
                            </h1>
                            <p className="font-inter text-sm text-secondary tracking-widest uppercase">
                                ID: {order.id.split('-')[0]} // {new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full w-fit ${order.status === 'PAID' ? 'bg-green-100 text-green-800 border border-green-200' :
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                (order.status as string) === 'FAILED' ? 'bg-red-100 text-red-800 border border-red-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            <span className="font-inter text-[10px] tracking-widest uppercase font-semibold">
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* State Machine Action Banners */}
                {order.status === 'PENDING' && (
                    <div className="order-animate mb-12 bg-amber-500/10 border border-amber-500/30 p-6 flex items-start gap-4">
                        <Info className="text-amber-600 mt-1 shrink-0" size={20} />
                        <div>
                            <h4 className="font-playfair text-xl text-amber-800 mb-2">Payment Processing</h4>
                            <p className="font-inter text-sm text-amber-900/80 leading-relaxed font-light">
                                Your bank has received the request and is currently processing it. Please wait a few minutes before taking any action to avoid double charges. If this session expires, you may safely retry below.
                            </p>
                        </div>
                    </div>
                )}

                {(order.status as string) === 'FAILED' && (
                    <div className="order-animate mb-12 bg-red-500/10 border border-red-500/30 p-6 flex items-start gap-4">
                        <AlertCircle className="text-red-600 mt-1 shrink-0" size={20} />
                        <div>
                            <h4 className="font-playfair text-xl text-red-800 mb-2">Payment Failed</h4>
                            <p className="font-inter text-sm text-red-900/80 leading-relaxed font-light">
                                We were unable to securely capture the funds from your bank. Your order has been placed on hold. Please try an alternative payment method to complete the transaction.
                            </p>
                        </div>
                    </div>
                )}

                {/* Items Grid */}
                <div className="order-animate mt-16 border-t border-light pt-8">
                    <h3 className="font-inter text-xs tracking-widest uppercase text-secondary mb-8">Items Overview</h3>

                    <div className="flex flex-col gap-8">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-secondary/30">
                                <div className="flex flex-col md:w-2/3">
                                    <h4 className="font-playfair text-2xl text-primary tracking-wide mb-2">
                                        {item.product.title}
                                    </h4>
                                    <div className="flex gap-4 font-inter text-xs tracking-widest uppercase text-secondary">
                                        <span>Type: {item.product.type}</span>
                                        <span>Qty: {item.quantity}</span>
                                    </div>

                                    {/* Digital Invite Specific Rendering */}
                                    {item.product.type === "DIGITAL" && item.digitalInvite && (
                                        <div className="mt-4 pt-4 border-t border-light/50">
                                            {item.digitalInvite.status === 'PUBLISHED' && item.digitalInvite.websiteUrl ? (
                                                <a href={item.digitalInvite.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-inter tracking-wide text-[#C5B39A] hover:underline flex items-center gap-2">
                                                    View Live Invitation →
                                                </a>
                                            ) : (
                                                <p className="text-[11px] font-inter tracking-widest uppercase text-secondary flex items-center gap-2">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${item.digitalInvite.status === 'DEVELOPMENT' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                                                    Status: {item.digitalInvite.status === 'DEVELOPMENT' ? 'Awaiting Deployment' : 'Draft'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 md:mt-0 font-inter text-lg text-primary">
                                    ₹{item.priceAtPurchase.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer and Totals */}
                <div className="order-animate mt-16 border-t border-light pt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="flex flex-col">
                        <span className="font-inter text-xs tracking-widest uppercase text-secondary mb-2">
                            {['PAID', 'COMPLETED', 'SHIPPED'].includes(order.status) ? 'Total Paid' : (order.status as string) === 'FAILED' ? 'Total Amount' : 'Amount Due'}
                        </span>
                        <span className="font-playfair text-4xl text-primary tracking-wide">
                            ₹{order.totalAmount.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex gap-4 print:hidden">
                        {['PAID', 'COMPLETED', 'SHIPPED'].includes(order.status) && (
                            <button
                                onClick={() => window.print()}
                                className="border border-secondary px-8 py-4 font-inter text-[11px] tracking-widest uppercase text-primary hover:bg-[#1A1A1A] hover:text-[#FBFBF9] transition-colors"
                            >
                                Print Receipt
                            </button>
                        )}
                        {(order.status === 'PENDING' || (order.status as string) === 'FAILED') && (
                            <button
                                onClick={() => retryPayment(order.id)}
                                disabled={isRetrying}
                                className={`bg-[#C5B39A] text-[#1A1A1A] px-8 py-4 font-inter text-[11px] tracking-widest uppercase flex items-center justify-center cursor-pointer transition-colors ${isRetrying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
                                    }`}
                            >
                                {isRetrying ? 'Regenerating Session...' : 'Retry Payment'}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
