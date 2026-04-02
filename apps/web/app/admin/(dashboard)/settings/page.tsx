"use client";

import { useEffect, useState } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { Mail, Phone, MessageCircle, Truck, MapPin, Instagram, Facebook, Save, Anchor, Settings, Bell, BellOff, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [me, setMe] = useState<any>(null);

    const hasSettingsRead = me?.isSuper || (me?.permissions?.settings && me.permissions.settings !== 'NONE');
    const hasSettingsWrite = me?.isSuper || me?.permissions?.settings === 'WRITE';

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch('/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            } else if (res.status === 403) {
                // Silently handle lack of permission for global settings
                console.warn('Admin does not have access to manage global store settings.');
            }
        } catch (error) {
            console.error('Failed to load settings', error);
            // toast.error('Failed to connect to Settings DB');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMe = async () => {
        try {
            const res = await adminApiFetch('/admin/users/me');
            if (res.ok) {
                const data = await res.json();
                setMe(data);
            }
        } catch (e) {
            console.error('Failed to fetch profile', e);
        }
    };

    useEffect(() => {
        fetchSettings();
        fetchMe();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await adminApiFetch('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Settings update failed');
            toast.success('Global settings locked efficiently.');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse text-gray-500 font-medium">Loading store settings matrix...</div>;
    }

    return (
        <div className="space-y-6 pb-12 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-3 uppercase">
                        <Settings size={32} className="text-gray-600" /> Admin Settings
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage global store parameters and your personal preferences.</p>
                </div>
                {hasSettingsWrite && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-gray-900 rounded-lg shadow-sm font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Encrypting...' : 'Save Configuration'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                {/* SECTION 2: E-Commerce Rules (Conditional) */}
                {hasSettingsRead && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <Truck className="w-5 h-5 text-emerald-500" /> E-Commerce Rules
                        </h2>

                        <div className="space-y-4">
                            <div className="group relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Free Shipping Threshold (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        disabled={!hasSettingsWrite}
                                        value={settings['FREE_SHIPPING_THRESHOLD'] || ''}
                                        onChange={(e) => handleChange('FREE_SHIPPING_THRESHOLD', e.target.value)}
                                        placeholder="5000"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm disabled:opacity-60"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Orders above this magnitude lock free shipping.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Standard Flat Rate Shipping (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        disabled={!hasSettingsWrite}
                                        value={settings['STANDARD_SHIPPING_RATE'] || ''}
                                        onChange={(e) => handleChange('STANDARD_SHIPPING_RATE', e.target.value)}
                                        placeholder="200"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm disabled:opacity-60"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Default weight cost metric for orders below threshold.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION 3: Social Links (Conditional) */}
                {hasSettingsRead && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                            <MapPin className="w-5 h-5 text-rose-500" /> Web Links
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"><MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp URL</label>
                                <input
                                    type="url"
                                    disabled={!hasSettingsWrite}
                                    value={settings['STORE_WHATSAPP_URL'] || ''}
                                    onChange={(e) => handleChange('STORE_WHATSAPP_URL', e.target.value)}
                                    placeholder="https://wa.me/919876543210"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"><Instagram className="w-4 h-4 text-pink-500" /> Instagram URL</label>
                                <input
                                    type="url"
                                    disabled={!hasSettingsWrite}
                                    value={settings['SOCIAL_INSTAGRAM_URL'] || ''}
                                    onChange={(e) => handleChange('SOCIAL_INSTAGRAM_URL', e.target.value)}
                                    placeholder="https://instagram.com/taksh.store"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-sm disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"><Facebook className="w-4 h-4 text-blue-600" /> Facebook URL</label>
                                <input
                                    type="url"
                                    disabled={!hasSettingsWrite}
                                    value={settings['SOCIAL_FACEBOOK_URL'] || ''}
                                    onChange={(e) => handleChange('SOCIAL_FACEBOOK_URL', e.target.value)}
                                    placeholder="https://facebook.com/taksh.store"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm disabled:opacity-60"
                                />
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
