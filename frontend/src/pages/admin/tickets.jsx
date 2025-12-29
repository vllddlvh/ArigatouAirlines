'use client'

import React, { useState, useEffect } from 'react';
import { Plane, Armchair, DollarSign, LayoutGrid, Ticket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Services ---

import { getAllTicketClasses } from '@/services/ticketsService';
import * as masterDataService from "@/services/masterDataService"; 

// --- Components ---
import { FlightListManagement } from '@/components/ticket/FlightListManagement';
import { FlightClassManagement } from '@/components/ticket/FlightClassManagement';
import { PricingManagement } from '@/components/ticket/PricingManagement';
import { SeatLayoutManagement } from '@/components/ticket/SeatLayoutManagement';
import { TicketDetailDialog } from '@/components/ticket/TicketDetailDialog';

const TicketManagementDashboard = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("flights");
    
    // Global State (Master Data)
    const [flights, setFlights] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog State
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // --- Fetch Data ---
    const fetchMasterData = async () => {
        setIsLoading(true);
        try {
            // Gọi song song API lấy Chuyến bay và Hạng vé
            const [flightsData, classesData] = await Promise.all([
                masterDataService.getAllFlights(),
                getAllTicketClasses()
            ]);
            
            // Xử lý dữ liệu trả về (dự phòng mảng rỗng nếu null/undefined)
            setFlights(Array.isArray(flightsData) ? flightsData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);
        } catch (error) {
            console.error(error);
            toast({ 
                title: "Lỗi kết nối", 
                description: "Không thể tải dữ liệu hệ thống. Vui lòng thử lại sau.", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    // --- Handlers ---
    const handleFlightClick = (flight) => {
        setSelectedFlight(flight);
        setIsDialogOpen(true);
    };

    // --- Helper Component: Tab Button ---
    const TabBtn = ({ value, icon: Icon, label }) => {
        const isActive = activeTab === value;
        return (
            <button 
                onClick={() => setActiveTab(value)}
                className={`
                    relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 transform -translate-y-1' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}
                `}
            >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:pl-72 transition-all duration-300 ml-[120px]">
            <div className="max-w-full mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <Ticket className="w-6 h-6" />
                            </div>
                            QUẢN LÝ VÉ MÁY BAY
                        </h1>
                        <p className="text-slate-500 mt-2 ml-1">
                            Trung tâm kiểm soát vé, hạng ghế và định giá chuyến bay.
                        </p>
                    </div>
                    
                    {/* Status Badge nhỏ gọn (Optional) */}
                    <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-slate-600">Hệ thống: Online</span>
                        </div>
                        <div className="w-px bg-gray-200 h-5 self-center"></div>
                        <div className="text-slate-600">
                            Flights: <span className="text-blue-600 font-bold">{flights.length}</span>
                        </div>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-slate-100/50 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                    <TabBtn value="flights" icon={Plane} label="Chuyến bay & Vé" />
                    <TabBtn value="classes" icon={Armchair} label="Hạng vé" />
                    <TabBtn value="pricing" icon={DollarSign} label="Định giá vé" />
                    <TabBtn value="layout" icon={LayoutGrid} label="Sơ đồ ghế" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden min-h-[600px] relative">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                            <p className="font-medium">Đang đồng bộ dữ liệu...</p>
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        {/* Tab Content: Flights List */}
                        {activeTab === 'flights' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FlightListManagement 
                                    flights={flights} 
                                    isLoading={isLoading} 
                                    onFlightClick={handleFlightClick} 
                                />
                            </div>
                        )}

                        {/* Tab Content: Ticket Classes */}
                        {activeTab === 'classes' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FlightClassManagement 
                                    classes={classes} 
                                    onRefresh={fetchMasterData} // Truyền hàm refresh để cập nhật lại list sau khi thêm/sửa
                                />
                            </div>
                        )}

                        {/* Tab Content: Pricing */}
                        {activeTab === 'pricing' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <PricingManagement 
                                    flights={flights} 
                                    classes={classes} 
                                />
                            </div>
                        )}

                        {/* Tab Content: Seat Layout */}
                        {activeTab === 'layout' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <SeatLayoutManagement aircraftId="MB001" /> 
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialog Chi tiết vé */}
                <TicketDetailDialog 
                    flight={selectedFlight} 
                    isOpen={isDialogOpen} 
                    onOpenChange={setIsDialogOpen} 
                />
            </div>
        </div>
    );
};

export default TicketManagementDashboard;