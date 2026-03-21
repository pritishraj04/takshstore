"use client";

import { IndianRupee, ShoppingCart, Mail, Users, Tag, PenSquare, FileCheck } from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const revenueData = [
  { month: 'Oct', canvas: 8000, digital: 15000 },
  { month: 'Nov', canvas: 12000, digital: 18000 },
  { month: 'Dec', canvas: 15000, digital: 22000 },
  { month: 'Jan', canvas: 18000, digital: 30000 },
  { month: 'Feb', canvas: 22000, digital: 35000 },
  { month: 'Mar', canvas: 28000, digital: 42000 },
];

const conversionData = [
  { name: 'Paid Orders', value: 340 },
  { name: 'Drafts', value: 890 },
];

const COLORS = ['#0f172a', '#94a3b8']; // slate-900 and slate-400

const recentActivity = [
    { id: 1, type: 'order', title: 'New order #1042 placed (₹2,400)', time: '10 minutes ago', icon: ShoppingCart },
    { id: 2, type: 'user', title: 'New user signed up (pritish@example.com)', time: '1 hour ago', icon: Users },
    { id: 3, type: 'draft', title: 'Draft #992 updated by Customer', time: '3 hours ago', icon: PenSquare },
    { id: 4, type: 'coupon', title: 'Coupon "WINTER50" used', time: '5 hours ago', icon: Tag },
    { id: 5, type: 'system', title: 'System bulk email dispatch completed', time: '1 day ago', icon: FileCheck },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 slide-in-bottom">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Overview</h1>
              <p className="text-gray-500 mt-1">Metrics, analytics, and ecosystem controls.</p>
            </div>
            
            {/* Layout Grid 1: KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard 
                    title="Total Revenue" 
                    value="₹2,45,000" 
                    icon={IndianRupee} 
                    trend={12} 
                    trendLabel="vs last month" 
                />
                <MetricCard 
                    title="Active Orders" 
                    value="42" 
                    icon={ShoppingCart} 
                    trend={5} 
                    trendLabel="vs last month" 
                />
                <MetricCard 
                    title="Draft Conversion" 
                    value="27.6%" 
                    icon={Mail} 
                    trend={-2} 
                    trendLabel="vs last month" 
                />
                <MetricCard 
                    title="Total Customers" 
                    value="1,204" 
                    icon={Users} 
                    trend={18} 
                    trendLabel="vs last month" 
                />
            </div>

            {/* Layout Grid 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Overview (Span 2) */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                       <span className="w-2 h-6 bg-black rounded-sm inline-block"></span>
                       Revenue Overview
                    </h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDigital" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCanvas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value / 1000}k`} dx={-10} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" name="Digital Revenue" dataKey="digital" stroke="#0f172a" fillOpacity={1} fill="url(#colorDigital)" />
                                <Area type="monotone" name="Canvas Revenue" dataKey="canvas" stroke="#94a3b8" fillOpacity={1} fill="url(#colorCanvas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Rate (Span 1) */}
                <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                       <span className="w-2 h-6 bg-gray-400 rounded-sm inline-block"></span>
                       Customizer Conversion Rate
                    </h3>
                    <div className="flex-1 min-h-[250px] w-full relative pb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conversionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle" 
                                    formatter={(value) => <span className="text-gray-600 text-sm ml-1 font-medium">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col -mt-4 pointer-events-none">
                             <p className="text-sm text-gray-400 font-medium">Conversion</p>
                             <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">27.6%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                       <span className="w-2 h-6 bg-gray-900 rounded-sm inline-block"></span>
                       Recent Activity Logs
                    </h3>
                    <button className="text-sm text-black font-semibold hover:underline bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">View All</button>
                </div>
                
                <div className="space-y-6 pl-2">
                    {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="flex gap-5 group">
                            <div className="relative flex flex-col items-center">
                                {/* Timeline line */}
                                {index !== recentActivity.length - 1 && (
                                    <div className="absolute top-10 bottom-[-24px] w-px bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                                )}
                                <div className="w-[42px] h-[42px] rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-500 z-10 group-hover:border-black group-hover:text-black transition-all shadow-sm">
                                    <activity.icon className="w-[18px] h-[18px]" />
                                </div>
                            </div>
                            <div className="pt-2 pb-4 flex-1">
                                <p className="text-[15px] font-medium text-gray-900 tracking-tight">{activity.title}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
}
