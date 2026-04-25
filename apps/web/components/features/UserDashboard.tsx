"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
type InviteStatus = "DRAFT" | "DEVELOPMENT" | "PUBLISHED";

type OrderStatus =
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "COMPLETED"
    | "PUBLISHED"
    | "DEVELOPMENT";

interface DigitalInvite {
    id: string;
    inviteData: InviteData;
    status: InviteStatus;
    websiteUrl?: string | null;
    isEternity?: boolean;
    marriageDate?: string;
    orderItem?: {
        orderId?: string;
        status?: string;
        order?: {
            id?: string;
            status?: any;
        };
        product?: {
            title?: string;
            type?: any;
            templateSlug?: string;
        };
    };
    slug?: string | null;
}

interface OrderItem {
    id?: string;
    quantity?: number;
    status?: string;
    product: {
        title: string;
        type: ProductType;
    };
    digitalInvite?: DigitalInvite | null;
    orderId?: string;
    order?: {
        id: string;
        status: OrderStatus;
    };
}




interface EnrichedOrderItem extends OrderItem {
    orderId: string;
    orderDate: string;
    orderStatus: OrderStatus;
    itemStatus?: string;
    totalAmount: number;
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
    const router = useRouter();
    const container = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"ORDERS" | "DRAFTS">("ORDERS");

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
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "power2.out", clearProps: "all" }
            );
        }
    }, [isLoading, orders, isInvitesLoading, myInvites, activeTab]);

    if (isLoading || isInvitesLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center font-playfair text-2xl text-primary tracking-widest uppercase">
                Loading Atelier...
            </div>
        );
    }

    const allItems: EnrichedOrderItem[] = orders?.flatMap((order) => order.items.map(item => ({ ...item, orderId: order.id, orderDate: order.createdAt, orderStatus: order.status, itemStatus: item.status || 'PENDING', totalAmount: order.totalAmount }))) || [];

    // Separate into SaaS invites vs Physical items
    const digitalItems = myInvites || [];
    const physicalItems = allItems.filter((item) => item.product.type === "PHYSICAL");

    const draftItems = digitalItems.filter(invite => invite.status === "DRAFT");
    const orderDigitalItems = digitalItems.filter(invite => invite.status !== "DRAFT");

    const handleCopyLink = (slug: string) => {
        const url = `${window.location.origin}/invites/${slug}`;
        navigator.clipboard.writeText(url);
        alert(`Link copied to clipboard: ${url}`);
    };

    const getStatusStyles = (status: string) => {
        const s = status?.toUpperCase();
        if (["PUBLISHED", "PAID", "SUCCESS", "COMPLETED", "DELIVERED"].includes(s)) {
            return "bg-green-50 border-green-100/50 text-green-700";
        }
        if (["PENDING", "DRAFT", "PROCESSING", "SHIPPED", "IN_TRANSIT"].includes(s)) {
            return "bg-amber-50 border-amber-100/50 text-amber-700";
        }
        if (["FAILED", "UNPAID", "CANCELLED", "REJECTED"].includes(s)) {
            return "bg-red-50 border-red-100/50 text-red-700";
        }
        return "bg-gray-50 border-gray-100 text-gray-500";
    };

    const renderDigitalItems = (items: DigitalInvite[], title: string) => {
        if (items.length === 0) return null;

        return (
            <div className="dashboard-animate mb-32">
                <h2 className="font-playfair text-3xl text-primary mb-12 flex items-center">
                    <Code size={24} className="mr-6 text-secondary" strokeWidth={1} />
                    {title}
                </h2>

                <div className="flex flex-col w-full">
                    {/* Header Row - Unified 5-column grid */}
                    <div className="hidden xl:grid xl:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-8 px-4 py-4 border-b border-light/30 items-center">
                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Item Details</span>
                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Event Date</span>
                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Current Status</span>
                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold"></span>
                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold text-right pr-6">Actions</span>
                    </div>

                    {items.map((invite) => {
                        const coupleNames =
                            invite.inviteData?.couple?.bride?.name &&
                                invite.inviteData?.couple?.groom?.name
                                ? `${invite.inviteData.couple.bride.name} & ${invite.inviteData.couple.groom.name}`
                                : invite.inviteData?.couple?.partner1 && invite.inviteData?.couple?.partner2
                                    ? `${invite.inviteData.couple.partner1} & ${invite.inviteData.couple.partner2}`
                                    : "The Couple";

                        const displayDate = invite.inviteData?.wedding?.displayDate || invite.marriageDate || "Date TBD";
                        const coupleImage = invite.inviteData?.couple?.image;

                        const itemStatus = invite.orderItem?.status || 'PENDING';
                        const orderStatus = invite.orderItem?.order?.status || 'UNPAID';
                        const isPaid = orderStatus === 'PAID' || orderStatus === 'PUBLISHED';
                        const isDraft = invite.status === 'DRAFT';

                        const handleRowClick = () => {
                            if (invite.orderItem?.orderId) {
                                router.push(`/dashboard/orders/${invite.orderItem.orderId}`);
                            }
                        };

                        return (
                            <div
                                key={invite.id}
                                onClick={handleRowClick}
                                className={`border-b border-light/50 py-8 grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-y-6 xl:gap-8 items-start xl:items-center group hover:bg-secondary/30 transition-all px-4 -mx-4 ${invite.orderItem?.orderId ? 'cursor-pointer' : ''}`}
                            >
                                {/* Column 1: Identity */}
                                <div className="flex items-center gap-6">
                                    {coupleImage && (
                                        <div className="shrink-0 w-16 h-16 rounded overflow-hidden border border-light/50 bg-white">
                                            <img src={coupleImage} alt="Couple" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <h3 className="font-playfair text-2xl text-primary tracking-wide">
                                            {invite.orderItem?.product?.title || (isDraft ? "Draft Invitation" : "Digital Invitation")}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="font-inter text-[9px] uppercase tracking-[0.2em] text-[#C5B39A] font-bold">
                                                {coupleNames}
                                            </span>
                                            {invite.slug && (
                                                <span className="font-inter text-[9px] text-amber-600 tracking-widest uppercase font-bold px-2 py-0.5 border border-amber-100 bg-amber-50 rounded-full">
                                                    Live: {invite.slug}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Date */}
                                <div className="flex flex-col">
                                    <span className="xl:hidden font-inter text-[9px] uppercase tracking-widest text-secondary/40 font-bold mb-1">Event Date</span>
                                    <span className="font-inter text-sm text-secondary font-light">
                                        {displayDate}
                                    </span>
                                </div>

                                {/* Column 3: Status */}
                                <div className="flex flex-col">
                                    <span className="xl:hidden font-inter text-[9px] uppercase tracking-widest text-secondary/40 font-bold mb-1">Status</span>
                                    {isDraft ? (
                                        <span className={`font-inter text-[8px] tracking-widest uppercase px-3 py-1 rounded-full w-full min-w-[100px] text-center font-bold ${getStatusStyles(invite.status)}`}>
                                            {invite.status}
                                        </span>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {/* Invite Status */}
                                            <div className={`flex items-center justify-center border px-3 py-1 rounded-full w-full min-w-[100px] ${getStatusStyles(invite.status)}`}>
                                                <span className="font-inter text-[8px] tracking-widest uppercase font-bold">
                                                    {invite.status}
                                                </span>
                                            </div>
                                            {/* Payment/Item Status indicator - only show if different or specifically relevant */}
                                            {itemStatus !== invite.status && (
                                                <div className={`flex items-center justify-center border px-3 py-1 rounded-full w-full min-w-[100px] ${getStatusStyles(itemStatus)}`}>
                                                    <span className="font-inter text-[8px] tracking-widest uppercase font-bold">
                                                        {itemStatus === 'PENDING' ? 'PENDING PUBLISH' : itemStatus}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Column 4: Empty (for alignment with physical) */}
                                <div className="hidden xl:block"></div>

                                {/* Column 5: Actions */}
                                <div className="flex flex-col gap-2 xl:items-end" onClick={(e) => e.stopPropagation()}>
                                    {(() => {
                                        const isExpired = invite.marriageDate && new Date() > new Date(invite.marriageDate) && !invite.isEternity;
                                        return isExpired ? (
                                            <div className="bg-gray-100 text-gray-500 font-inter text-[10px] tracking-widest uppercase py-2 px-6 flex items-center cursor-not-allowed border border-light opacity-60">
                                                🔒 Locked
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/customizer/${invite.id}`}
                                                className="bg-[#1A1A1A] text-white font-inter text-[10px] tracking-widest uppercase py-2 px-6 hover:bg-black transition-colors flex items-center justify-center group shadow-sm w-full min-w-[120px]"
                                            >
                                                Edit
                                                <ArrowRight size={12} className="ml-2 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                                            </Link>
                                        );
                                    })()}

                                    {invite.slug && (
                                        <>
                                            <a
                                                href={`/invites/${invite.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-inter text-[10px] tracking-widest uppercase py-2 px-4 border border-light bg-white hover:bg-[#FAF9F6] transition-colors flex items-center justify-center gap-2 text-secondary w-full min-w-[120px]"
                                            >
                                                <Globe size={13} strokeWidth={1.5} />
                                                View Live
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/invites/${invite.slug}`;
                                                    navigator.clipboard.writeText(url);
                                                    import("sonner").then(m => m.toast.success('Link copied!'));
                                                }}
                                                className="font-inter text-[10px] tracking-widest uppercase py-2 px-4 border border-light bg-white hover:bg-[#FAF9F6] transition-colors flex items-center justify-center gap-2 text-secondary w-full min-w-[120px]"
                                            >
                                                <Link2 size={13} strokeWidth={1.5} />
                                                Copy Link
                                            </button>
                                        </>
                                    )}

                                    {isDraft && (
                                        <button
                                            onClick={() => handleDeleteDraft(invite.id)}
                                            disabled={deleteDraftMutation.isPending && deleteDraftMutation.variables === invite.id}
                                            className="font-inter text-[10px] tracking-widest uppercase py-2 px-4 border border-transparent hover:border-red-100 bg-red-50 text-red-600 transition-colors flex items-center justify-center gap-2 w-full min-w-[120px]"
                                        >
                                            <Trash2 size={13} strokeWidth={1.5} />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div ref={container} className="pt-40 pb-32 px-6 md:px-16 lg:px-32 bg-primary min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="dashboard-animate mb-12 md:mb-16 wrap-break-word">
                    <h4 className="font-inter text-xs tracking-widest uppercase text-secondary mb-2 md:mb-4">
                        Private Atelier
                    </h4>
                    <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-primary tracking-wide leading-tight">
                        Welcome back, {name}.
                    </h1>
                </div>

                <div className="dashboard-animate mb-12 flex gap-8 border-b border-[#E5E4DF]">
                    <button
                        onClick={(e) => { e.preventDefault(); setActiveTab("ORDERS"); }}
                        className={`pb-4 font-inter text-sm tracking-widest uppercase transition-colors relative ${activeTab === "ORDERS" ? "text-primary font-bold" : "text-secondary hover:text-primary"}`}
                    >
                        Orders
                        {activeTab === "ORDERS" && <span className="absolute -bottom-px left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); setActiveTab("DRAFTS"); }}
                        className={`pb-4 font-inter text-sm tracking-widest uppercase transition-colors relative ${activeTab === "DRAFTS" ? "text-primary font-bold" : "text-secondary hover:text-primary"}`}
                    >
                        Drafts
                        {activeTab === "DRAFTS" && <span className="absolute -bottom-px left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                </div>

                {activeTab === "ORDERS" && (
                    <>
                        {renderDigitalItems(orderDigitalItems, "Digital Orders")}

                        {physicalItems.length > 0 && (
                            <div className="dashboard-animate mb-32">
                                <h2 className="font-playfair text-3xl text-primary mb-12 flex items-center">
                                    <Brush size={24} className="mr-6 text-secondary" strokeWidth={1} />
                                    Physical Collection
                                </h2>

                                <div className="flex flex-col w-full">
                                    {/* Header Row - Only visible on XL */}
                                    <div className="hidden xl:grid xl:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-8 px-4 py-4 border-b border-light/30 items-center">
                                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Item Details</span>
                                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Ordered On</span>
                                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Status</span>
                                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold">Total Amount</span>
                                        <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold text-right pr-12">Actions</span>
                                    </div>

                                    {physicalItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => router.push(`/dashboard/orders/${item.orderId}`)}
                                            className="border-b border-light/50 py-8 grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-y-6 xl:gap-8 items-start xl:items-center group hover:bg-secondary/30 transition-all px-4 -mx-4 cursor-pointer"
                                        >
                                            <div className="flex flex-col">
                                                <h3 className="font-playfair text-2xl text-primary tracking-wide">
                                                    {item.product.title}
                                                </h3>
                                                <span className="font-inter text-[9px] uppercase tracking-[0.2em] text-[#C5B39A] font-bold mt-1">
                                                    Physical Keepsake
                                                </span>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="xl:hidden font-inter text-[9px] uppercase tracking-widest text-secondary/40 font-bold mb-1">Ordered On</span>
                                                <span className="font-inter text-sm text-secondary font-light">
                                                    {new Date(item.orderDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="xl:hidden font-inter text-[9px] uppercase tracking-widest text-secondary/40 font-bold mb-1">Status</span>
                                                <span className={`font-inter text-[8px] uppercase tracking-widest font-bold px-3 py-1 border rounded-full w-full min-w-[100px] text-center ${getStatusStyles(item.itemStatus || item.orderStatus)}`}>
                                                    {(item.itemStatus || item.orderStatus) === 'PENDING' ? 'PENDING PUBLISH' : (item.itemStatus || item.orderStatus)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="xl:hidden font-inter text-[9px] uppercase tracking-widest text-secondary/40 font-bold mb-1">Total</span>
                                                <span className="font-inter text-sm text-secondary font-semibold">
                                                    ₹{item.totalAmount.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2 xl:items-end w-full xl:w-auto" onClick={(e) => e.stopPropagation()}>
                                                <div className="font-inter text-[10px] tracking-widest uppercase py-2 px-6 border border-light bg-white group-hover:bg-[#1A1A1A] group-hover:text-white transition-all shadow-sm w-full min-w-[120px] text-center">
                                                    View Details
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orderDigitalItems.length === 0 && physicalItems.length === 0 && (
                            <div className="dashboard-animate mt-16 text-center">
                                <p className="font-inter text-sm text-secondary font-light tracking-wide mb-8">
                                    You have no orders yet.
                                </p>
                                <Link
                                    href="/collection"
                                    className="font-inter text-xs uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#C5B39A] hover:border-[#C5B39A] transition-colors"
                                >
                                    Explore the Gallery
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "DRAFTS" && (
                    <>
                        {renderDigitalItems(draftItems, "Draft Invites")}

                        {draftItems.length === 0 && (
                            <div className="dashboard-animate mt-16 text-center">
                                <p className="font-inter text-sm text-secondary font-light tracking-wide mb-8">
                                    You have no draft invites.
                                </p>
                                <Link
                                    href="/collection"
                                    className="font-inter text-xs uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#C5B39A] hover:border-[#C5B39A] transition-colors"
                                >
                                    Explore the Gallery
                                </Link>
                            </div>
                        )}
                    </>
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
