"use client";

import { useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Code, Brush, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { InviteData, ProductType } from "@taksh/types";

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
}

interface OrderItem {
    id: string;
    quantity: number;
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

    useGSAP(() => {
        if (!isLoading && orders) {
            gsap.fromTo(
                ".dashboard-animate",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power2.out" }
            );
        }
    }, [isLoading, orders]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center font-playfair text-2xl text-primary tracking-widest uppercase">
                Loading Atelier...
            </div>
        );
    }

    const allItems = orders?.flatMap((order) => order.items.map(item => ({ ...item, orderId: order.id, orderDate: order.createdAt, orderStatus: order.status, totalAmount: order.totalAmount }))) || [];

    // Separate into SaaS invites vs Physical items
    const digitalItems = allItems.filter((item) => item.product.type === "DIGITAL" && item.digitalInvite !== null);
    const physicalItems = allItems.filter((item) => item.product.type === "PHYSICAL");

    return (
        <div ref={container} className="pt-40 pb-32 px-6 md:px-16 lg:px-32 bg-primary min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="dashboard-animate mb-24">
                    <h4 className="font-inter text-xs tracking-widest uppercase text-secondary mb-4">
                        Private Atelier
                    </h4>
                    <h1 className="font-playfair text-5xl md:text-6xl text-primary tracking-wide">
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
                            {digitalItems.map((item) => {
                                const invite = item.digitalInvite!;
                                const coupleNames =
                                    invite.inviteData?.couple?.partner1 &&
                                        invite.inviteData?.couple?.partner2
                                        ? `${invite.inviteData.couple.partner1} & ${invite.inviteData.couple.partner2}`
                                        : "The Couple";

                                return (
                                    <div
                                        key={invite.id}
                                        className="bg-secondary p-8 border border-light/50 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className={`h-2 w-2 rounded-full ${invite.status === "PUBLISHED" ? "bg-green-500" : "bg-gray-400"}`} />
                                                <span className="font-inter text-[10px] tracking-widest uppercase text-secondary font-medium">
                                                    {invite.status}
                                                </span>
                                            </div>
                                            <h3 className="font-playfair text-3xl mt-8 mb-2 text-primary tracking-wide">
                                                {coupleNames} Celebration
                                            </h3>
                                            <p className="font-inter text-sm text-secondary font-light">
                                                {item.product.title}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/customizer/${invite.id}`}
                                            className="font-inter text-[11px] tracking-widest uppercase text-primary hover:text-[#C5B39A] transition-colors mt-12 block py-2 inline-flex items-center group w-fit"
                                        >
                                            <span className="mr-3 transition-transform group-hover:translate-x-1">
                                                <ArrowRight size={14} strokeWidth={1} />
                                            </span>
                                            Continue Editing
                                        </Link>
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
                                        <span className="font-inter text-xs uppercase tracking-widest text-[#1A1A1A] mb-2 font-medium">
                                            {item.orderStatus}
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
        </div>
    );
}
