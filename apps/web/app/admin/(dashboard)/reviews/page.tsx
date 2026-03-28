"use client";

import { useState, useEffect } from "react";
import { adminApiFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Star, Check, X, MessageSquare } from "lucide-react";

export default function ReviewsAdminPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch("/admin/reviews");
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await adminApiFetch(`/admin/reviews/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            
            if (res.ok) {
                toast.success(`Review ${status.toLowerCase()}`);
                setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Server error");
        }
    };

    const filteredReviews = reviews.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

    if (isLoading) {
        return <div className="p-8 text-gray-500 animate-pulse">Loading Reviews...</div>;
    }

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <MessageSquare size={24} className="text-amber-500" /> Review Moderation
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage customer product perspectives and verify authenticity.</p>
                </div>
                
                <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm w-max">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter as any)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                statusFilter === filter ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="bg-white border rounded-xl p-16 text-center shadow-sm">
                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-gray-900 font-semibold mb-1">No {statusFilter.toLowerCase()} reviews</h3>
                    <p className="text-gray-500 text-sm mb-6">When customers submit reviews, they will appear here based on your filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Rating</th>
                                    <th className="px-6 py-4 font-semibold min-w-[200px]">Comment</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{review.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{review.user?.email || ''}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                                Order ID: {review.order?.id?.split('-')[0]}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {review.product?.title || 'Unknown Product'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="w-48 xl:w-80 truncate text-gray-600" title={review.comment || 'No comment'}>
                                                {review.comment ? `"${review.comment}"` : <span className="text-gray-400 italic">No comment provided</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                review.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                review.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {review.status === 'PENDING' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors border border-emerald-200/50"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-semibold transition-colors border border-rose-200/50"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400">Moderated</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
