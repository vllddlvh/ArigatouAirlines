'use client'

import { Plane, Users, DollarSign, BarChart3, TrendingUp, TrendingDown, Clock4, Database, LayoutDashboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils' // Giả định utility cn có sẵn

// --- SKY SENSE ANALYTICS BRAND COLORS ---
const SS_COLORS = {
    DeepBlue: '#0A2540',    // Màu xanh đại dương sâu (chủ đạo)
    SunsetOrange: '#FF6F3D', // Màu cam hoàng hôn (điểm nhấn)
    LightGrey: '#F8F9FA',   // Xám rất nhạt cho nền tổng thể
    MediumGrey: '#E0E0E0',  // Xám trung bình cho border nhẹ
    DarkText: '#343A40',    // Màu text đậm
    LightText: '#CED4DA',   // Màu text nhạt (trên nền tối)
    AccentGreen: '#28A745', // Xanh lá cây cho trend up
    AccentRed: '#DC3545',   // Đỏ cho trend down
}

// Màu sắc cho Biểu đồ
const CHART_PALETTE = [SS_COLORS.SunsetOrange, SS_COLORS.DeepBlue, '#4CAF50', '#FFC107', '#17A2B8', '#6C757D']

// --- DỮ LIỆU MOCK (Dùng chung) ---
const flightStatusData = [
    { name: 'Chưa Cất Cánh', value: 5, fill: '#FFAB91' }, // Light Orange
    { name: 'Đang Bay', value: 2, fill: '#64B5F6' }, // Light Blue
    { name: 'Đã Hạ Cánh', value: 45, fill: SS_COLORS.DeepBlue }
]

const aircraftData = [
    { name: 'Airbus A320', value: 15 },
    { name: 'Airbus A330', value: 8 },
    { name: 'Boeing 767', value: 4 },
    { name: 'Boeing 777', value: 7 },
    { name: 'Embraer 190', value: 3 }
]

// Custom Tooltip cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm">
          <p className="font-semibold text-deepBlue mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
};

// Custom Label cho Pie Chart (hiển thị phần trăm bên ngoài)
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20; // Khoảng cách từ tâm đến label
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fill={SS_COLORS.DarkText}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
};


// --- HELPER COMPONENT: Stat Card (Enhanced) ---
function StatKioskCardEnhanced({ title, value, icon: Icon, iconBgColor, valueColor, description, trend = 'up' }) {
    const formatValue = (val) => {
        if (title.includes("Doanh thu")) { // Dựa vào title để xác định tiền tệ
            const usdValue = (val / 25454).toFixed(2);
            return `${usdValue.toLocaleString('en-US')} $`;
        }
        return val.toLocaleString('vi-VN');
    };

    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
    const trendColorClass = trend === 'up' ? 'text-accentGreen' : 'text-accentRed';
    const trendBgClass = trend === 'up' ? 'bg-green-50' : 'bg-red-50'; // Nền nhẹ cho trend

    return (
        <Card className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border border-gray-100">
            <CardContent className="flex items-center p-6 bg-white relative">
                <div className="relative z-10 p-3 rounded-full flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-105" 
                     style={{ backgroundColor: iconBgColor + '20' }}> {/* Màu nền icon nhạt */}
                    <Icon className="h-7 w-7" style={{ color: iconBgColor }} />
                </div>
                
                <div className="ml-5 flex-grow relative z-10">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-extrabold mt-0.5" style={{ color: valueColor }}>{formatValue(value)}</h3>
                    <div className={cn("inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1", trendBgClass, trendColorClass)}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        <span>{description}</span>
                    </div>
                </div>
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Corner accent */}
                <div className="absolute top-0 right-0 h-10 w-10 rounded-bl-xl" style={{backgroundColor: iconBgColor + '30'}}></div>
            </CardContent>
        </Card>
    );
}

// --- MAIN DASHBOARD REDESIGN ---
export default function DashboardAdvanced() {
    const router = useRouter()
    const [data, setData] = useState({
        "totalAircrafts": 37, // New stat
        "flightsToday": 42,
        "ticketsThisWeek": 1500,
        "revenueThisMonth": 3818100000 // VND
    })

    // Mock useEffect for initial data load or API call
    useEffect(() => {
        // const token = localStorage.getItem('token');
        // if (!token) { router.push('/admin'); }
        // getStatistic(); // Uncomment if you have a real API
        
        // Simulating data fetching after a delay
        setTimeout(() => {
            setData({
                "totalAircrafts": aircraftData.reduce((sum, item) => sum + item.value, 0),
                "flightsToday": 42,
                "ticketsThisWeek": 1500,
                "revenueThisMonth": 3818100000
            });
            toast({
                title: "Dữ liệu được cập nhật",
                description: "Dashboard đã tải xong thông tin mới nhất.",
            });
        }, 1500);
    }, []);

    // Placeholder for API call
    const getStatistic = async () => { /* ... */ }

    return (
        <div className="container mx-auto p-4 lg:pl-64 space-y-10 bg-lightGrey min-h-screen font-sans">
            
            {/* Tiêu đề Dashboard */}
            <header className="pt-10 pb-6 border-b-2 border-mediumGrey/50 text-center relative">
                <LayoutDashboard className="h-10 w-10 text-deepBlue absolute left-1/2 -translate-x-1/2 -top-5 p-2 bg-lightGrey rounded-full shadow-lg" />
                <h1 className="text-4xl font-extrabold text-deepBlue tracking-tight">SkySense <span style={{color: SS_COLORS.SunsetOrange}}>Analytics</span></h1>
                <p className="text-lg text-darkText/70 mt-2">Tổng quan hiệu suất vận hành hãng hàng không của bạn</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-deepBlue via-sunsetOrange to-deepBlue opacity-30"></div>
            </header>

            {/* 1. Kiosk Cards (5 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                
                <StatKioskCardEnhanced
                    title="Tổng số máy bay"
                    value={data.totalAircrafts}
                    icon={Plane}
                    iconBgColor={SS_COLORS.DeepBlue}
                    valueColor={SS_COLORS.DeepBlue}
                    description="Trong đội bay hiện tại"
                    trend='up'
                />

                <StatKioskCardEnhanced
                    title="Chuyến bay hôm nay"
                    value={data.flightsToday}
                    icon={Clock4}
                    iconBgColor={SS_COLORS.SunsetOrange}
                    valueColor={SS_COLORS.SunsetOrange}
                    description="Đã lên lịch & bay"
                    trend='up'
                />

                <StatKioskCardEnhanced
                    title="Vé đã đặt tuần này"
                    value={data.ticketsThisWeek}
                    icon={Users}
                    iconBgColor={SS_COLORS.AccentGreen}
                    valueColor={SS_COLORS.AccentGreen}
                    description="+15% so với tuần trước"
                    trend='up'
                />

                <StatKioskCardEnhanced
                    title="Doanh thu tháng này"
                    value={data.revenueThisMonth}
                    icon={DollarSign}
                    iconBgColor={SS_COLORS.DeepBlue}
                    valueColor={SS_COLORS.DeepBlue}
                    description="+8.2% so với tháng trước"
                    trend='up'
                />

                <StatKioskCardEnhanced
                    title="Dữ liệu tổng"
                    value={120000} // Ví dụ: số lượng bản ghi dữ liệu
                    icon={Database}
                    iconBgColor={SS_COLORS.MediumGrey}
                    valueColor={SS_COLORS.DarkText}
                    description="Bản ghi hệ thống"
                    trend='up' // Có thể thay đổi trend dựa trên số lượng dữ liệu
                />
            </div>

            {/* 2. Biểu đồ Phân tích - Grid 2 cột */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* 2.1. Flight Status Chart (Bar Chart) */}
                <Card className="shadow-2xl rounded-xl overflow-hidden bg-white p-6 border border-mediumGrey/50">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-xl font-bold text-darkText border-l-4 border-sunsetOrange pl-3">
                            Tình Trạng Chuyến Bay Hiện Tại
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">Phân bố các chuyến bay theo trạng thái vận hành.</p>
                    </CardHeader>
                    <CardContent className="p-0 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flightStatusData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SS_COLORS.MediumGrey} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: SS_COLORS.DarkText, fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: SS_COLORS.DarkText, fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="value" barSize={40} radius={[8, 8, 0, 0]} >
                                    {flightStatusData.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={entry.fill || CHART_PALETTE[index % CHART_PALETTE.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2.2. Aircrafts Distribution Chart (Pie Chart) */}
                <Card className="shadow-2xl rounded-xl overflow-hidden bg-white p-6 border border-mediumGrey/50">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-xl font-bold text-darkText border-l-4 border-deepBlue pl-3">
                            Phân Bổ Loại Máy Bay
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">Cơ cấu đội bay của hãng hàng không.</p>
                    </CardHeader>
                    <CardContent className="p-0 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aircraftData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    cornerRadius={5}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={renderCustomizedLabel} // Custom label hiển thị % bên ngoài
                                >
                                    {aircraftData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}