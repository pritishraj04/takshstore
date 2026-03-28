"use client";

import { useRef, useEffect, useState } from "react";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Code, Brush, ArrowRight, ExternalLink, Link2, Check, Globe, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { InviteData, ProductType } from "@taksh/types";
import { useMyInvites } from "../../hooks/useMyInvites";

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
    inviteData: InviteData;
    status: InviteStatus;
    websiteUrl: string | null;
    isEternity?: boolean;
    marriageDate?: string;
    orderItem?: any;
    slug?: string;
}

interface OrderItem {
    id: string;
    quantity: number;
    status: string;
    product: {
        title: string;
        type: ProductType;
    };
    digitalInvite: DigitalInvite | null;
}

interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
}

interface UserDashboardProps {
    name: string;
}

export default function UserDashboard({ name }: UserDashboardProps) {
    const container = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const deleteDraftMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/digital-invites/draft/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-invites"] });
            import("sonner").then(m => m.toast.success('Draft deleted successfully.'));
            setDeleteConfirmId(null);
        },
        onError: () => {
            import("sonner").then(m => m.toast.error('Failed to delete draft.'));
            setDeleteConfirmId(null);
        }
    });

    const handleDeleteDraft = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            deleteDraftMutation.mutate(deleteConfirmId);
        }
    };

    // Invalidate cache if returning from a successful checkout redirect
    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });

            // Clean up the URL string to prevent infinite refresh cycles
            window.history.replaceState(null, "", "/dashboard");
        }
    }, [searchParams, queryClient]);

    // Fetch orders from the API
    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ["orders"],
        queryFn: async () => {
            const { data } = await apiClient.get("/orders");
            return data;
        },
    });

    const { data: myInvites, isLoading: isInvitesLoading } = useMyInvites();

    useGSAP(() => {
        if (!isLoading && orders && !isInvitesLoading && myInvites) {
            gsap.fromTo(
                ".dashboard-animate",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power2.out" }
            );
        }
    }, [isLoading, orders, isInvitesLoading, myInvites]);

    if (isLoading || isInvitesLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center font-playfair text-2xl text-primary tracking-widest uppercase">
                Loading Atelier...
            </div>
        );
    }

    const allItems = orders?.flatMap((order) => order.items.map(item => ({ ...item, orderId: order.id, orderDate: order.createdAt, orderStatus: order.status, itemStatus: item.status, totalAmount: order.totalAmount }))) || [];

    // Separate into SaaS invites vs Physical items
    const digitalItems = myInvites || [];
    const physicalItems = allItems.filter((item) => item.product.type === "PHYSICAL");

    const handleCopyLink = (slug: string) => {
        const url = `${window.location.origin}/invites/${slug}`;
        navigator.clipboard.writeText(url);
        alert(`Link copied to clipboard: ${url}`);
    };

    return (
        <div ref={container} className="pt-40 pb-32 px-6 md:px-16 lg:px-32 bg-primary min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="dashboard-animate mb-16 md:mb-24 wrap-break-word">
                    <h4 className="font-inter text-xs tracking-widest uppercase text-secondary mb-2 md:mb-4">
                        Private Atelier
                    </h4>
                    <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-primary tracking-wide leading-tight">
                        Welcome back, {name}.
                    </h1>
                </div>

                {digitalItems.length > 0 && (
                    <div className="dashboard-animate mb-32">
                        <h2 className="font-playfair text-3xl text-primary mb-12 flex items-center">
                            <Code size={24} className="mr-6 text-secondary" strokeWidth={1} />
                            Digital Commissions
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {digitalItems.map((invite) => {
                                const coupleNames =
                                    invite.inviteData?.couple?.partner1 &&
                                        invite.inviteData?.couple?.partner2
                                        ? `${invite.inviteData.couple.partner1} & ${invite.inviteData.couple.partner2}`
                                        : "The Couple";

                                const itemStatus = invite.orderItem?.status || 'PENDING';
                                const orderStatus = invite.orderItem?.order?.status || 'UNPAID';
                                const isPaid = orderStatus === 'PAID' || orderStatus === 'PUBLISHED';

                                return (
                                    <div
                                        key={invite.id}
                                        className="bg-secondary p-8 border border-light/50 flex flex-col justify-between h-full min-h-[300px]"
                                    >
                                        <div>
                                            {/* Pills Row */}
                                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
                                                {/* Invite Status */}
                                                <div className="flex items-center gap-2 border border-[#E5E4DF] px-3 py-1 bg-white rounded-full">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${invite.status === "PUBLISHED" ? "bg-green-500" : "bg-gray-400"}`} />
                                                    <span className="font-inter text-[9px] tracking-widest uppercase text-secondary font-medium">
                                                        {invite.status}
                                                    </span>
                                                </div>
                                                {/* Payment Status */}
                                                <div className="flex items-center gap-2 border border-[#E5E4DF] px-3 py-1 bg-white rounded-full">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isPaid ? "bg-green-500" : "bg-red-500"}`} />
                                                    <span className={`font-inter text-[9px] tracking-widest uppercase font-medium ${itemStatus === 'PUBLISHED' ? "text-green-700" : "text-amber-600"}`}>
                                                        {itemStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="font-playfair text-3xl mb-2 text-primary tracking-wide">
                                                {coupleNames} Celebration
                                            </h3>
                                            <p className="font-inter text-sm text-secondary font-light">
                                                Digital Suite
                                            </p>
                                        </div>

                                        {/* Action Row */}
                                        <div className="mt-8 md:mt-12 flex flex-wrap gap-3 md:gap-4 items-center pt-4 border-t border-[#E5E4DF]">
                                            {(() => {
                                                const isExpired = invite.marriageDate && new Date() > new Date(invite.marriageDate) && !invite.isEternity;
                                                return isExpired ? (
                                                    <div className="bg-gray-300 text-gray-500 font-inter text-xs tracking-widest uppercase py-2 px-6 flex items-center group w-fit cursor-not-allowed">
                                                        <span className="mr-2">🔒</span>
                                                        Locked (Date Passed)
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/customizer/${invite.id}`}
                                                        className="bg-[#1A1A1A] text-white font-inter text-xs tracking-widest uppercase py-2 px-6 hover:bg-black transition-colors flex items-center group w-fit"
                                                    >
                                                        <span className="mr-2 transition-transform group-hover:translate-x-1">
                                                            <ArrowRight size={14} strokeWidth={1.5} />
                                                        </span>
                                                        Edit
                                                    </Link>
                                                );
                                            })()}

                                            {invite.orderItem?.orderId && (
                                                <Link
                                                    href={`/dashboard/orders/${invite.orderItem.orderId}`}
                                                    className="bg-transparent text-[#1A1A1A] font-inter text-xs tracking-widest uppercase py-2 px-4 hover:bg-[#F2F1EC] border border-transparent hover:border-[#E5E4DF] transition-colors flex items-center gap-2"
                                                >
                                                    Order Details
                                                </Link>
                                            )}

                                            {invite.slug && (
                                                <>
                                                    <a
                                                        href={`/invites/${invite.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-transparent text-[#1A1A1A] font-inter text-xs tracking-widest uppercase py-2 px-4 hover:bg-[#F2F1EC] border border-transparent hover:border-[#E5E4DF] transition-colors flex items-center gap-2"
                                                    >
                                                        <Globe size={14} strokeWidth={1.5} />
                                                        View Live
                                                    </a>

                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/invites/${invite.slug}`;
                                                            navigator.clipboard.writeText(url);
                                                            import("sonner").then(m => m.toast.success('Link copied to clipboard!'));
                                                        }}
                                                        className="bg-transparent text-[#1A1A1A] font-inter text-xs tracking-widest uppercase py-2 px-4 hover:bg-[#F2F1EC] border border-transparent hover:border-[#E5E4DF] transition-colors flex items-center gap-2"
                                                    >
                                                        <Link2 size={14} strokeWidth={1.5} />
                                                        Copy Link
                                                    </button>
                                                </>
                                            )}
                                            
                                            {invite.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleDeleteDraft(invite.id)}
                                                    disabled={deleteDraftMutation.isPending && deleteDraftMutation.variables === invite.id}
                                                    className="bg-transparent text-red-600 font-inter text-xs tracking-widest uppercase py-2 px-4 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-2 ml-auto mt-2 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={14} strokeWidth={1.5} />
                                                    {deleteDraftMutation.isPending && deleteDraftMutation.variables === invite.id ? "Deleting..." : "Delete"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {physicalItems.length > 0 && (
                    <div className="dashboard-animate">
                        <h2 className="font-playfair text-3xl text-primary mb-12 flex items-center">
                            <Brush size={24} className="mr-6 text-secondary" strokeWidth={1} />
                            Physical Collection
                        </h2>

                        <div className="flex flex-col w-full">
                            {physicalItems.map((item) => (
                                <Link
                                    href={`/dashboard/orders/${item.orderId}`}
                                    key={item.id}
                                    className="border-b border-light py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-secondary/30 transition-colors px-4 -mx-4 cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-inter text-xs text-secondary mb-2 tracking-wide font-light">
                                            Order placed {new Date(item.orderDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <h3 className="font-playfair text-2xl text-primary tracking-wide">
                                            {item.product.title}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-light border-dashed">
                                        <span className={`font-inter text-[10px] uppercase tracking-widest mb-2 font-medium ${item.itemStatus === 'PUBLISHED' ? 'text-green-700' : 'text-[#1A1A1A]'}`}>
                                            {item.itemStatus || item.orderStatus}
                                        </span>
                                        <span className="font-inter text-sm text-secondary font-light">
                                            ₹{item.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {digitalItems.length === 0 && physicalItems.length === 0 && (
                    <div className="dashboard-animate mt-32 text-center">
                        <p className="font-inter text-sm text-secondary font-light tracking-wide mb-8">
                            Your collection is currently empty.
                        </p>
                        <Link
                            href="/collection"
                            className="font-inter text-xs uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#C5B39A] hover:border-[#C5B39A] transition-colors"
                        >
                            Explore the Gallery
                        </Link>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#FAF9F6] w-full max-w-md p-8 border border-[#E5E4DF] shadow-2xl">
                        <h3 className="font-playfair text-3xl text-[#1A1A1A] mb-4">Delete Draft</h3>
                        <p className="font-inter text-[#4A4A4A] text-sm mb-6 sm:mb-8 font-light leading-relaxed">
                            Are you sure you want to delete this draft? This action cannot be undone and all data will be permanently removed.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={deleteDraftMutation.isPending}
                                className="font-inter text-xs tracking-widest uppercase py-3 px-6 border border-[#E5E4DF] text-[#1A1A1A] hover:bg-[#F2F1EC] transition-colors disabled:opacity-50 text-center w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteDraftMutation.isPending}
                                className="font-inter text-xs tracking-widest uppercase py-3 px-6 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                            >
                                {deleteDraftMutation.isPending ? "Deleting..." : "Delete Draft"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
