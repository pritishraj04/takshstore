import { Ticket, Activity, CheckCircle2, Clock } from 'lucide-react';

interface CouponTileProps {
  data: {
    active: number;
    inactive: number;
    totalUsage: number;
  };
}

export function CouponTile({ data }: CouponTileProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-600" />
          Coupons
        </h3>
        <span className="text-xs text-gray-400">Status Overview</span>
      </div>

      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center">
          <p className="text-4xl font-black text-indigo-600">{data.totalUsage}</p>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-tight">Total Usage Count</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 transition-colors hover:bg-green-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-700">{data.active}</p>
                <p className="text-xs text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 transition-colors hover:bg-red-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-red-700">{data.inactive}</p>
                <p className="text-xs text-red-600 font-medium">Inactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 mt-auto">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center">Managed by Marketing & Sales</p>
      </div>
    </div>
  );
}
