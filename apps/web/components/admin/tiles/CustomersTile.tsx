import { Users, TrendingUp, UserPlus, RefreshCw } from 'lucide-react';

interface CustomersTileProps {
  count: number;
}

export function CustomersTile({ count }: CustomersTileProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 underline underline-offset-4 decoration-indigo-600 decoration-2 italic">
          <Users className="w-5 h-5 text-indigo-600" />
          Acquisition
        </h3>
        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-indigo-100">Live Growth</span>
      </div>

      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl animate-pulse -z-10" />
          <p className="text-5xl font-black text-indigo-600 tracking-tighter drop-shadow-sm">{count}</p>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-tight">New Signups</p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <div className="flex bg-green-50/50 px-4 py-2 rounded-full border border-green-100 shadow-sm transition-all hover:scale-105">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-tighter">Growth Positive</span>
          </div>
          <div className="flex bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm transition-all hover:scale-105">
            <UserPlus className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-tighter">Verified</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 mt-auto">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center">Data refreshed automatically</p>
      </div>
    </div>
  );
}
