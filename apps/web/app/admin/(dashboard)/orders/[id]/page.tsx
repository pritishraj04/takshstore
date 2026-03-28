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



    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch(`/admin/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
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

    const handleUpdateItemStatus = async (itemId: string, newStatus: string) => {
        try {
            const res = await adminApiFetch(`/admin/orders/${id}/items/${itemId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Item status update failed');
            toast.success('Item status updated!');
            await fetchOrder(); // refresh data
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggleEternity = async (itemId: string, currentVal: boolean) => {
        try {
            const res = await adminApiFetch(`/admin/orders/order-items/${itemId}/eternity`, {
                method: 'PATCH',
                body: JSON.stringify({ isEternity: !currentVal }),
            });
            if (!res.ok) throw new Error();
            toast.success('Eternity flag toggled');
            await fetchOrder();
        } catch {
            toast.error('Failed to toggle eternity');
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
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <p className="text-xs text-gray-500">Quantity: {item.quantity} • {item.product.type}</p>
                                            
                                            <select 
                                                value={item.status || 'PENDING'} 
                                                onChange={(e) => handleUpdateItemStatus(item.id, e.target.value)}
                                                className="ml-auto px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold uppercase outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {item.product.type === 'PHYSICAL' ? (
                                                    <>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="PROCESSING">Processing</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="PAID">Paid</option>
                                                        <option value="PUBLISHED">Published</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        
                                        {item.product.type === 'DIGITAL' && item.digitalInvite && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                {item.hasPaidEternity && (
                                                    <span className="w-fit px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 mb-1 shadow-sm">
                                                        <CheckCircle className="w-3 h-3" /> PAID: Eternity Add-on
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`eternity-${item.id}`}
                                                        checked={item.digitalInvite.isEternity || false}
                                                        onChange={() => handleToggleEternity(item.id, item.digitalInvite.isEternity)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <label htmlFor={`eternity-${item.id}`} className="text-xs font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
                                                        Host Site for Eternity
                                                        {item.hasPaidEternity && !item.digitalInvite.isEternity && (
                                                            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                                                <ShieldAlert className="w-3 h-3" /> Warning: Customer paid for this
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        )}
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
                                        {order.shippingAddress.name || order.user.name}
                                        {'\n'}{order.shippingAddress.line1 || order.shippingAddress.address}
                                        {order.shippingAddress.line2 && `\n${order.shippingAddress.line2}`}
                                        {'\n'}{order.shippingAddress.city}, {order.shippingAddress.state || ''} {order.shippingAddress.postal_code || order.shippingAddress.postalCode}
                                        {order.shippingAddress.country && `\n${order.shippingAddress.country}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Context */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-indigo-600" /> Order Matrix
                        </h2>
                        <p className="text-xs text-gray-500 mb-6">Payment and legacy logistics control.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Flow Status</label>
                                <div className="w-full px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm font-bold text-green-700 uppercase flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {order.status}
                                </div>
                            </div>

                            {order.trackingUrl && (
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Global Tracking URL</label>
                                    <p className="text-xs text-gray-600 break-all">{order.trackingUrl}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Anchor className="w-4 h-4 text-emerald-500" /> Financials
                        </h2>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-sm font-medium">₹{(order.subtotal || order.totalAmount).toLocaleString()}</span>
                        </div>
                        {order.shippingCost > 0 && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Shipping</span>
                                <span className="text-sm font-medium">₹{order.shippingCost.toLocaleString()}</span>
                            </div>
                        )}
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                                <span className="text-sm font-medium text-emerald-600">-₹{order.discountAmount.toLocaleString()}</span>
                            </div>
                        )}
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
