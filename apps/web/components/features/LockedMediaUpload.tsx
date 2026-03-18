import { Lock } from 'lucide-react';

export const LockedMediaUpload = ({ title, description }: { title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl text-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-3">
            <Lock size={18} className="text-gray-500" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 max-w-[250px]">{description}</p>
    </div>
);
