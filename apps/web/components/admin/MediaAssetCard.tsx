"use client";

import { ExternalLink, Trash2, Headphones } from 'lucide-react';

interface MediaAssetCardProps {
    asset: {
        id: string;
        type: 'IMAGE' | 'MUSIC';
        url: string;
        uploadedAt: string;
        user?: { name: string; email: string } | null;
        uploaderType?: 'ADMIN' | 'USER' | 'SYSTEM';
    };
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export function MediaAssetCard({ asset, onDelete, isDeleting }: MediaAssetCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
            {/* Visual Header */}
            <div className="bg-gray-50 flex items-center justify-center relative border-b border-gray-100/60">
                {asset.type === 'IMAGE' ? (
                    <div className="w-full h-48 relative overflow-hidden group">
                        <img src={asset.url} alt="User Upload" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                            Image
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-48 flex flex-col items-center justify-center bg-indigo-50/50 relative p-4 group">
                        <div className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                            Audio
                        </div>
                        <Headphones className="w-12 h-12 text-indigo-300 mb-4 transition-transform group-hover:scale-110 duration-300" />
                        <audio controls src={asset.url} className="w-full h-10 mt-2 filter drop-shadow-sm" />
                    </div>
                )}
            </div>

            {/* Content & Actions Footer */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1 mb-[22px]">
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                        {new Date(asset.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">
                            {asset.user?.name || 'System / Anonymous'}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded w-fit border ${asset.uploaderType === 'ADMIN'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                            {asset.uploaderType || 'USER'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => onDelete(asset.id)}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-lg transition-colors border border-red-100 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wide"
                >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Takedown Asset'}
                </button>
            </div>
        </div>
    );
}
