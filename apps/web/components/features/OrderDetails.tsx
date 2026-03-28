"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useOrder } from "../../hooks/useOrder";
import { useRetryPayment } from "../../hooks/useRetryPayment";
import { useOrderReviews } from "../../hooks/useOrderReviews";
import { ReviewModal } from "./ReviewModal";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Info, AlertCircle, Star } from "lucide-react";
import { ProductType } from "@taksh/types";

// Types matching the Prisma backend
enum InviteStatus {
    DRAFT = "DRAFT",
    DEVELOPMENT = "DEVELOPMENT",
    PAID = "PAID",
}

enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    PUBLISHED = "PUBLISHED",
}

interface DigitalInvite {
    id: string;
    status: InviteStatus;
    websiteUrl: string | null;
    isEternity?: boolean;
    marriageDate?: string;
}

interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: number;
    hasPaidEternity?: boolean;
    status: string;
    product: {
        id: string;
        title: string;
        type: ProductType;
        price: number;
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
    const { data: orderReviews = [] } = useOrderReviews(orderId);

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null);

    const isDelivered = order && (order.status === 'COMPLETED' || order.status === 'SHIPPED' || order.status === 'DELIVERED');

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
                                        {item.hasPaidEternity && (
                                            <span className="text-[#C5B39A] font-bold">Eternity Hosting: Active</span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {item.status || 'PENDING'}
                                        </span>
                                    </div>

                                    {/* Digital Invite Specific Rendering */}
                                    {item.product.type === "DIGITAL" && item.digitalInvite && (
                                        <div className="mt-4 pt-4 border-t border-light/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                {item.status === 'PUBLISHED' && item.digitalInvite.websiteUrl ? (
                                                    <a href={item.digitalInvite.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-inter tracking-wide text-[#C5B39A] hover:underline flex items-center gap-2 mb-2 md:mb-0">
                                                        View Live Invitation →
                                                    </a>
                                                ) : (
                                                    <p className="text-[11px] font-inter tracking-widest uppercase text-secondary flex items-center gap-2 mb-2 md:mb-0">
                                                        <span className={`h-1.5 w-1.5 rounded-full ${item.digitalInvite.status === 'PAID' ? 'bg-green-500' :
                                                            item.digitalInvite.status === 'DEVELOPMENT' ? 'bg-amber-500' : 'bg-gray-400'
                                                            }`} />
                                                        Status: {
                                                            item.digitalInvite.status === 'PAID' ? 'Ready to Publish' :
                                                                item.digitalInvite.status === 'DEVELOPMENT' ? 'Awaiting Deployment' : 'Draft'
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {(() => {
                                                const invite = item.digitalInvite;
                                                const isExpired = invite.marriageDate && new Date() > new Date(invite.marriageDate) && !invite.isEternity;

                                                return isExpired ? (
                                                    <div className="bg-gray-300 text-gray-500 font-inter text-[10px] tracking-widest uppercase py-2 px-4 flex items-center group w-fit cursor-not-allowed">
                                                        <span className="mr-2">🔒</span>
                                                        Locked (Date Passed)
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/customizer/${invite.id}`}
                                                        className="bg-[#1A1A1A] text-white font-inter text-[10px] tracking-widest uppercase py-2 px-4 hover:bg-black transition-colors flex items-center group w-fit"
                                                    >
                                                        Edit Invite
                                                    </Link>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 md:mt-0 flex flex-col md:items-end gap-4 min-w-[120px]">
                                    {item.product.price && item.priceAtPurchase < item.product.price ? (
                                        <div className="flex flex-col items-end">
                                            <span className="font-inter text-xs text-gray-400 line-through tracking-wider mb-1">
                                                ₹{item.product.price.toLocaleString()}
                                            </span>
                                            <div className="font-inter text-xl text-primary font-medium tracking-wide">
                                                ₹{item.priceAtPurchase.toLocaleString()}
                                            </div>
                                            <span className="font-inter text-[10px] text-green-700 tracking-widest uppercase mt-1">
                                                Sale Applied
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="font-inter text-xl text-primary font-medium tracking-wide">
                                            ₹{item.priceAtPurchase.toLocaleString()}
                                        </div>
                                    )}

                                    {(() => {
                                        const isItemDelivered = item.product.type === 'DIGITAL'
                                            ? item.status === 'PUBLISHED'
                                            : ['DELIVERED', 'COMPLETED'].includes(item.status);

                                        if (isItemDelivered) {
                                            return (
                                                <div className="print:hidden">
                                                    {(() => {
                                                        const existingReview = orderReviews.find((r: any) => r.productId === item.product.id);
                                                        if (existingReview) {
                                                            return (
                                                                <span className="flex items-center gap-1.5 font-inter text-xs tracking-widest text-[#C5B39A] uppercase bg-white px-3 py-1.5 border border-[#E5E4DF] rounded-full shadow-sm">
                                                                    <Star size={12} className="fill-[#C5B39A]" />
                                                                    {existingReview.status === 'APPROVED' ? 'Reviewed' : 'Review Pending'}
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProduct({ id: item.product.id, name: item.product.title });
                                                                    setReviewModalOpen(true);
                                                                }}
                                                                className="font-inter text-[10px] tracking-widest uppercase text-secondary hover:text-black border border-secondary hover:border-black px-4 py-2 transition-colors flex items-center gap-2 rounded-full"
                                                            >
                                                                <Star size={12} />
                                                                Leave a Review
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
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

            {selectedProduct && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    orderId={orderId}
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                />
            )}
        </div>
    );
}
