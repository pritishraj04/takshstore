import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend: number;
    trendLabel: string;
}

export function MetricCard({ title, value, icon: Icon, trend, trendLabel }: MetricCardProps) {
    const isPositive = trend >= 0;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md hover:border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-lg text-gray-400 border border-gray-100/50">
                   <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex-1 mt-1">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
                <span className="text-gray-400 font-normal ml-2">{trendLabel}</span>
            </div>
        </div>
    );
}
