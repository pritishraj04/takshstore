"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { ArrowLeft, Package, User, Clock, CheckCircle, Truck, FileCheck, Anchor, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrderDetailsPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fulfillment State
    const [status, setStatus] = useState<string>('');
    const [trackingUrl, setTrackingUrl] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                setStatus(data.status);
                setTrackingUrl(data.trackingUrl || '');
            } else {
                toast.error('Order not found');
                router.push('/admin/orders');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const handleUpdateStatus = async () => {
        setIsUpdating(true);
        try {
            const res = await adminApiFetch(`/admin/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, trackingUrl: status === 'SHIPPED' ? trackingUrl : undefined }),
            });
            if (!res.ok) throw new Error('Status update failed');
            toast.success('Order status updated!');
            await fetchOrder(); // refresh data
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="p-8 animate-pulse text-gray-500">Loading fulfillment record...</div>;
    if (!order) return null;

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in pb-12">
            <div className="flex items-center gap-3">
                <Link href="/admin/orders" className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString()} • {order.items.length} Items</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Order Items & Customer Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-500" /> Products
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-md border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                                        {item.product.imageUrl ? (
                                            <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm">{item.product.title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} • {item.product.type}</p>
                                    </div>
                                    <div className="text-right font-medium text-sm">
                                        ₹{item.priceAtPurchase.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" /> Customer Matrix
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Contact</p>
                                <p className="font-medium text-sm text-gray-900">{order.user.name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-600">{order.user.email}</p>
                                {order.user.phone && <p className="text-sm text-gray-600">{order.user.phone}</p>}
                            </div>
                            {order.shippingAddress && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Shipping Address</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {order.shippingAddress.name}
                                        {'\n'}{order.shippingAddress.line1}
                                        {order.shippingAddress.line2 && `\n${order.shippingAddress.line2}`}
                                        {'\n'}{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                                        {'\n'}{order.shippingAddress.country}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Fulfillment Status (THE CORE REQUIREMENT) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-indigo-600" /> Fulfillment Status
                        </h2>
                        <p className="text-xs text-gray-500 mb-6">Manage post-payment lifecycle.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Status</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm font-medium"
                                >
                                    <option value="PENDING">Pending (Awaiting Process)</option>
                                    <option value="PAID">Paid (Ready)</option>
                                    <option value="PROCESSING">Processing (Manufacturing)</option>
                                    <option value="SHIPPED">Shipped (In Transit)</option>
                                    <option value="COMPLETED">Completed (Delivered)</option>
                                    <option value="FAILED">Failed / Refunded</option>
                                </select>
                            </div>

                            {status === 'SHIPPED' && (
                                <div className="animate-in slide-in-top-2 fade-in duration-300">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tracking URL or Courier AWB</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://track.courier.xyz..."
                                        value={trackingUrl}
                                        onChange={(e) => setTrackingUrl(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-indigo-50/30 border border-indigo-100 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">If a physical Canvas product is attached, an automated shipping email will blast to the customer carrying this link instantly.</p>
                                </div>
                            )}

                            <button 
                                onClick={handleUpdateStatus}
                                disabled={isUpdating}
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? 'Syncying...' : 'Update Status'}
                            </button>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Anchor className="w-4 h-4 text-emerald-500" /> Financials
                        </h2>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-sm font-medium">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-2 pt-3">
                            <span className="text-sm font-bold text-gray-900">Total Charged</span>
                            <span className="text-lg font-black text-emerald-600">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
