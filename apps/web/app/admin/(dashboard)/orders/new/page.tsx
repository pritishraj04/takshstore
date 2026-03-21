"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft, Package, User } from 'lucide-react';
import Link from 'next/link';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';

export default function CreateManualOrderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState('PAID');
    const [sendEmailReceipt, setSendEmailReceipt] = useState(true);
    
    // Address UI (Only if Physical)
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
    });

    // New Customer Sub-Modal State
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '' });
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // --- Select Data Fetchers --- //
    const loadCustomerOptions = async (inputValue: string) => {
        if (!inputValue) return [];
        const res = await adminApiFetch(`/admin/customers?search=${inputValue}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.map((u: any) => ({
            label: `${u.name || 'Unknown'} (${u.email})`,
            value: u.id,
            user: u
        }));
    };

    const loadProductOptions = async (inputValue: string) => {
        const res = await adminApiFetch(`/admin/products`);
        if (!res.ok) return [];
        const json = await res.json();
        
        // Exclude drafts and filter if user typed
        return json
            .filter((p: any) => p.status === 'ACTIVE')
            .filter((p: any) => p.title.toLowerCase().includes(inputValue.toLowerCase()))
            .map((p: any) => ({
                label: `[${p.type}] ${p.title} - ₹${p.price}`,
                value: p.id,
                product: p
            }));
    };

    // --- Handlers --- //
    const handleCustomerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingCustomer(true);
        try {
            const res = await adminApiFetch('/admin/customers', {
                method: 'POST',
                body: JSON.stringify(newCustomerForm)
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            
            setSelectedUser({ label: `${created.name} (${created.email})`, value: created.id, user: created });
            setIsCustomerModalOpen(false);
            setNewCustomerForm({ name: '', email: '', phone: '' });
            toast.success('Customer created instantly.');
        } catch (e: any) {
            toast.error(e.message || 'Failed to create customer');
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!selectedUser || !selectedProduct || !customPrice) {
            toast.error('Please complete all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                userId: selectedUser.value,
                productId: selectedProduct.value,
                orderType: selectedProduct.product.type,
                customPrice: parseFloat(customPrice),
                paymentStatus,
                sendEmailReceipt
            };

            if (selectedProduct.product.type === 'PHYSICAL') {
                payload.shippingAddress = shippingAddress;
            }

            const res = await adminApiFetch('/admin/orders/manual', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            toast.success('Manual order deployed securely.');
            router.push('/admin/orders');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Transmission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-bottom duration-500 fade-in py-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Manual Order</h1>
                    <p className="text-gray-500 text-sm mt-1">Directly build and authorize B2B or custom request orders securely.</p>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                {['Customer', 'Product', 'Summary'].map((label, idx) => (
                    <div key={label} className={`flex items-center gap-2 ${step === idx + 1 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= idx + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {step > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className="font-semibold">{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Customer Selection */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Select Customer Entity</h3>
                            <p className="text-gray-500 text-sm">Assign this manual order to an existing or entirely new customer.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-900">Search Customer Record</label>
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <AsyncSelect
                                    instanceId="customer-search"
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadCustomerOptions}
                                    onChange={(opt) => setSelectedUser(opt)}
                                    value={selectedUser}
                                    placeholder="Type to search by name or email..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <span className="text-gray-400 font-bold mt-2">OR</span>
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="px-5 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg whitespace-nowrap transition-colors"
                            >
                                + Create New
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            disabled={!selectedUser}
                            onClick={() => setStep(2)}
                            className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            Next Step &rarr;
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Product */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Product Blueprint</h3>
                            <p className="text-gray-500 text-sm">Select the source item and define the manual overrides.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Target Product</label>
                            <AsyncSelect
                                instanceId="product-search"
                                cacheOptions
                                defaultOptions
                                loadOptions={loadProductOptions}
                                onChange={(opt: any) => {
                                    setSelectedProduct(opt);
                                    setCustomPrice(opt?.product?.price?.toString() || '');
                                }}
                                value={selectedProduct}
                                placeholder="Search active SKUs..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {selectedProduct && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Custom Subtotal Price (₹)</label>
                                <input
                                    type="number"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    placeholder="Enter final cost..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Retail Price is ₹{selectedProduct.product.price}. Adjust if establishing an off-market deal.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between">
                        <button onClick={() => setStep(1)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition">
                            &larr; Back
                        </button>
                        <button 
                            disabled={!selectedProduct || !customPrice}
                            onClick={() => setStep(3)}
                            className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            Next Step &rarr;
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Logistics & Confirmation */}
            {step === 3 && (
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold">Logistics & Execution</h3>
                        <p className="text-gray-500 text-sm">Designate the receipting and shipping behavior before locking the ledger.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Status</label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full px-4 py-2 font-semibold text-sm border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                            >
                                <option value="PAID">PAID (Cash/Bank execution complete)</option>
                                <option value="PENDING">PENDING (Waiting for client funds)</option>
                            </select>
                        </div>

                        {selectedProduct?.product?.type === 'PHYSICAL' && (
                            <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-sm">Shipping Destination</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Street Address" value={shippingAddress.street} onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} className="col-span-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-md" />
                                    <input placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md" />
                                    <input placeholder="State / Region" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md" />
                                    <input placeholder="Postal Code" value={shippingAddress.zip} onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md" />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="sendReceipt" 
                                checked={sendEmailReceipt} 
                                onChange={(e) => setSendEmailReceipt(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            />
                            <label htmlFor="sendReceipt" className="text-sm font-semibold cursor-pointer">
                                Emit Automated Email Receipt globally 
                                <span className="block text-xs text-gray-500 font-normal">Triggers SMTP transport if PAID, delivering links via automated modules natively.</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between">
                        <button onClick={() => setStep(2)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition">
                            &larr; Back
                        </button>
                        <button 
                            disabled={isSubmitting}
                            onClick={handleCreateOrder}
                            className={`px-8 py-2.5 font-bold rounded-lg transition-all ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'}`}
                        >
                            {isSubmitting ? 'Authorizing...' : 'Authorize Manual Order'}
                        </button>
                    </div>
                </div>
            )}

            {/* Sub-Modal for Fast Customer Creation */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Register Customer</h2>
                        <form onSubmit={handleCustomerSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input required value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Pipeline</label>
                                <input type="email" required value={newCustomerForm.email} onChange={e => setNewCustomerForm({...newCustomerForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Ledger</label>
                                <input placeholder="+91..." value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black text-sm" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isCreatingCustomer} className="flex-1 py-2 font-bold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50">
                                    {isCreatingCustomer ? 'Generating...' : 'Establish User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
