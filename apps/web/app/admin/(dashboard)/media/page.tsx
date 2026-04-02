"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Image as ImageIcon, Music } from 'lucide-react';
import { adminApiFetch } from '@/lib/admin-api';
import { MediaAssetCard } from '@/components/admin/MediaAssetCard';
import { toast } from 'sonner';

export default function AdminMediaGalleryPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'IMAGE' | 'MUSIC'>('IMAGE');
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch('/admin/media');
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Server error: ${res.status}`);
            }
            const data = await res.json();
            setAssets(data);
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to load media: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (mediaId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this asset from S3? This cannot be undone.")) {
            return;
        }

        setDeletingIds(prev => new Set(prev).add(mediaId));

        try {
            const res = await adminApiFetch(`/admin/media/${mediaId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete asset');
            }

            toast.success("Asset permanently terminated.");
            setAssets(prev => prev.filter(a => a.id !== mediaId));
            
            // Optional: Hard re-fetch to ensure sync
            // await fetchMedia(); 
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(mediaId);
                return next;
            });
        }
    };

    const filteredAssets = assets.filter(a => a.type === activeTab);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-3 uppercase">
                    <ImageIcon size={32} className="text-fuchsia-600" /> Media Moderation
                  </h1>
                  <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Review and manage raw files uploaded to S3 by your customers.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('IMAGE')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'IMAGE' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <ImageIcon className="w-[18px] h-[18px]" /> Photos ({assets.filter(a => a.type === 'IMAGE').length})
                </button>
                <button
                    onClick={() => setActiveTab('MUSIC')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'MUSIC' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <Music className="w-[18px] h-[18px]" /> Audio Files ({assets.filter(a => a.type === 'MUSIC').length})
                </button>
            </div>

            {/* Grid display */}
            <div className="pt-2">
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                       <div className="flex animate-pulse space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                       </div>
                       <p className="text-sm font-medium text-gray-400 mt-4 leading-none">Scanning S3 indices...</p>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="bg-white border rounded-2xl py-28 flex flex-col items-center justify-center border-dashed border-gray-200/80">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                        <h4 className="text-gray-900 font-bold text-lg tracking-tight">No {activeTab.toLowerCase()} assets found.</h4>
                        <p className="text-gray-500 text-sm mt-1">Customers haven't uploaded any {activeTab.toLowerCase()} content.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-4">
                        {filteredAssets.map(asset => (
                            <MediaAssetCard 
                                key={asset.id}
                                asset={asset}
                                onDelete={handleDelete}
                                isDeleting={deletingIds.has(asset.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
