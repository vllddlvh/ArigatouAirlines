'use client'

import React, { useState, useEffect } from 'react'
import { 
    Plane, Users, DollarSign, BarChart3, TrendingUp, TrendingDown, Clock, 
    LayoutDashboard, MapPin, Wind, Ticket, Calendar, Search, Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, 
    ResponsiveContainer, Legend, Tooltip, AreaChart, Area, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { cn } from '@/lib/utils'

// --- DATA (Giữ nguyên dữ liệu giả lập) ---
const revenueData = [
    { month: 'Jan', revenue: 4000, profit: 2400 },
    { month: 'Feb', revenue: 3000, profit: 1398 },
    { month: 'Mar', revenue: 2000, profit: 9800 },
    { month: 'Apr', revenue: 2780, profit: 3908 },
    { month: 'May', revenue: 1890, profit: 4800 },
    { month: 'Jun', revenue: 2390, profit: 3800 },
    { month: 'Jul', revenue: 3490, profit: 4300 },
];

const flightStatusData = [
    { name: 'Đúng giờ', value: 65, color: '#10B981' }, // Emerald 500
    { name: 'Delay < 30p', value: 20, color: '#F59E0B' }, // Amber 500
    { name: 'Delay > 30p', value: 10, color: '#F97316' }, // Orange 500
    { name: 'Hủy chuyến', value: 5, color: '#EF4444' },   // Red 500
];

const ticketClassData = [
    { name: 'Economy', value: 850, color: '#3B82F6' }, // Blue 500
    { name: 'Business', value: 120, color: '#8B5CF6' }, // Violet 500
    { name: 'First Class', value: 30, color: '#F43F5E' }, // Rose 500
];

const fleetPerformanceData = [
    { subject: 'Bảo trì', A: 120, B: 110, fullMark: 150 },
    { subject: 'Nhiên liệu', A: 98, B: 130, fullMark: 150 },
    { subject: 'Đúng giờ', A: 86, B: 130, fullMark: 150 },
    { subject: 'An toàn', A: 99, B: 100, fullMark: 150 },
    { subject: 'Dịch vụ', A: 85, B: 90, fullMark: 150 },
    { subject: 'Tải trọng', A: 65, B: 85, fullMark: 150 },
];

const topDestinations = [
    { city: 'Hồ Chí Minh', flights: 120 },
    { city: 'Hà Nội', flights: 98 },
    { city: 'Đà Nẵng', flights: 86 },
    { city: 'Phú Quốc', flights: 54 },
    { city: 'Bangkok', flights: 42 },
];

// --- COMPONENTS ---

// 1. KPI Card (Light Theme)
const KPICard = ({ title, value, subValue, icon: Icon, trend, trendValue, color }) => (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
                </div>
                {/* Icon với nền màu nhạt tương ứng */}
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300 border border-${color}-100`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
                <div className={cn(
                    "flex items-center text-xs font-bold px-2.5 py-1 rounded-full border",
                    trend === 'up' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {trendValue}
                </div>
                <span className="text-slate-400 text-xs font-medium">{subValue}</span>
            </div>
        </CardContent>
    </Card>
);

// 2. Custom Tooltip (Light Theme)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xl">
                <p className="text-slate-800 font-bold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm py-0.5">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-500 font-medium">{entry.name}:</span>
                        <span className="text-slate-900 font-bold font-mono">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- MAIN PAGE ---
export default function AirlineDashboardLight() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className= "ml-[250px] min-h-screen w-[1200px] bg-slate-50 text-slate-900 p-6 lg:pl-8 font-sans">
            
            {/* Header Section */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">SkySense Analytics</h1>
                        <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Hệ thống online • Cập nhật: Vừa xong
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm chuyến bay, số hiệu..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors text-white shadow-md">
                        + Tạo chuyến bay
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard 
                    title="Tổng Doanh Thu (YTD)" value="$12.4M" subValue="so với tháng trước"
                    icon={DollarSign} trend="up" trendValue="+12.5%" color="emerald"
                />
                <KPICard 
                    title="Tổng Hành Khách" value="24,592" subValue="7 ngày qua"
                    icon={Users} trend="up" trendValue="+8.2%" color="blue"
                />
                <KPICard 
                    title="Chuyến Bay Thực Hiện" value="1,204" subValue="Tỷ lệ hủy: 0.8%"
                    icon={Plane} trend="down" trendValue="-2.1%" color="indigo"
                />
                <KPICard 
                    title="Hiệu Suất OTP" value="94.8%" subValue="On-Time Performance"
                    icon={Clock} trend="up" trendValue="+1.4%" color="amber"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Revenue Trends (Light Mode) */}
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-slate-800">
                            <span>Phân Tích Doanh Thu</span>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md border border-blue-100">Doanh thu</span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md border border-emerald-100">Lợi nhuận</span>
                            </div>
                        </CardTitle>
                        <CardDescription className="text-slate-500">Dữ liệu tài chính 6 tháng đầu năm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueLight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorProfitLight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueLight)" />
                                    <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfitLight)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Flight Status (Donut Chart Light) */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Trạng Thái Vận Hành</CardTitle>
                        <CardDescription className="text-slate-500">Tỷ lệ chuyến bay hôm nay</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <div className="h-[320px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={flightStatusData}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={5}
                                    >
                                        {flightStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center">
                                <p className="text-4xl font-extrabold text-slate-800">94%</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỷ lệ bay</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: 3 Cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 3. Top Destinations */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-rose-500" /> Top Điểm Đến
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {topDestinations.map((dest, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-700 font-bold">{dest.city}</span>
                                        <span className="text-slate-500 font-medium">{dest.flights} chuyến</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000 ease-out group-hover:w-full" 
                                            style={{ width: `${(dest.flights / 150) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Fleet Radar Chart */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <Wind className="w-5 h-5 text-indigo-500" /> Chỉ Số Đội Bay
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fleetPerformanceData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Đội bay A"
                                    dataKey="A"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fill="#3B82F6"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Đội bay B"
                                    dataKey="B"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="#10B981"
                                    fillOpacity={0.2}
                                />
                                <Legend formatter={(val) => <span className="text-slate-600 text-xs font-bold">{val}</span>} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 5. Ticket Classes */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-amber-500" /> Phân Hạng Vé
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between h-[280px]">
                        <div className="w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ticketClassData}
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {ticketClassData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-4 pr-4">
                            {ticketClassData.map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-500 text-sm font-medium">{item.name}</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 pl-5">{item.value.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}