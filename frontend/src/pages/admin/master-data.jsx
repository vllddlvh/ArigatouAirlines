import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plane, Landmark, Building2, Database } from 'lucide-react';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import * as masterDataService from '@/services/masterDataService';

// Import Sub-components
import AirportTab from '@/components/MasterData/AirportTab';
import AirlineTab from '@/components/MasterData/AirlineTab';
import AircraftTab from '@/components/MasterData/AircraftTab';

function MasterDataManagementDashboard() {
    const { toast } = useToast();
    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [aircraftTypes, setAircraftTypes] = useState([]);
    const [activeTab, setActiveTab] = useState("airports");
    const [isLoading, setIsLoading] = useState(false);

    // --- Fetch Data ---
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [airportRes, airlineRes, aircraftRes, aircraftTypeRes] = await Promise.all([
                masterDataService.getAllAirports(),
                masterDataService.getAllAirlines(),
                masterDataService.getAllAircrafts(),
                masterDataService.getAllAircraftTypes(),
            ]);

            setAirports(airportRes || []);
            setAirlines(airlineRes || []);
            setAircrafts(aircraftRes || []);
            setAircraftTypes(aircraftTypeRes || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            toast({ title: "Lỗi kết nối", description: "Không thể tải dữ liệu từ server.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    // --- Central Action Handler ---
    const handleAction = async ({ type, payload }) => {
        setIsLoading(true);
        try {
            let desc = "";
            switch (type) {
                // Airport
                case "ADD_AIRPORT": await masterDataService.createAirport(payload); desc = "Thêm sân bay thành công."; break;
                case "UPDATE_AIRPORT": await masterDataService.updateAirport(payload.id, payload.data); desc = "Cập nhật sân bay thành công."; break;
                case "DELETE_AIRPORT": await masterDataService.deleteAirport(payload); desc = "Xóa sân bay thành công."; break;
                // Airline
                case 'ADD_AIRLINE': await masterDataService.createAirline(payload); desc = `Thêm hãng ${payload.airlineCode} thành công.`; break;
                case 'UPDATE_AIRLINE': await masterDataService.updateAirline(payload.airlineId, payload); desc = "Cập nhật hãng thành công."; break;
                case 'DELETE_AIRLINE': await masterDataService.deleteAirline(payload); desc = "Xóa hãng thành công."; break;
                // Aircraft
                case 'ADD_AIRCRAFT': await masterDataService.createAircraft(payload); desc = `Thêm máy bay ${payload.registrationNumber} thành công.`; break;
                case 'UPDATE_AIRCRAFT': await masterDataService.updateAircraft(payload.id, payload.data); desc = "Cập nhật máy bay thành công."; break;
                case 'DELETE_AIRCRAFT': await masterDataService.deleteAircraft(payload); desc = "Xóa máy bay thành công."; break;
                default: throw new Error("Hành động không xác định");
            }
            await fetchAllData();
            toast({ title: "Thành công", description: desc, variant: "success", className: "bg-green-50 border-green-200 text-green-800" });
        } catch (error) {
            toast({ title: "Thất bại", description: typeof error === 'string' ? error : "Có lỗi xảy ra khi xử lý.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Tab Trigger Component ---
    const tabStyles = {
        blue: {
            active: "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200",
            icon: "text-blue-600",
            hover: "hover:bg-blue-50/50 hover:text-blue-600",
            indicator: "bg-blue-500"
        },
        orange: {
            active: "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200",
            icon: "text-orange-600",
            hover: "hover:bg-orange-50/50 hover:text-orange-600",
            indicator: "bg-orange-500"
        },
        emerald: {
            active: "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200",
            icon: "text-emerald-600",
            hover: "hover:bg-emerald-50/50 hover:text-emerald-600",
            indicator: "bg-emerald-500"
        }
    };

    // --- 2. Component Tab Trigger Mới ---
    const CustomTabTrigger = ({ value, icon: Icon, label, colorKey }) => {
        const isActive = activeTab === value;
        const style = tabStyles[colorKey];

        return (
            <button
                onClick={() => setActiveTab(value)}
                className={`
                    relative flex-1 group py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ease-out flex items-center justify-center gap-3
                    ${isActive 
                        ? style.active 
                        : `text-gray-500 bg-transparent ${style.hover}`
                    }
                `}
            >
                {/* Icon wrapper */}
                <div className={`
                    p-1.5 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-white shadow-sm scale-110' : 'bg-transparent scale-100'}
                `}>
                    <Icon className={`
                        w-5 h-5 transition-colors duration-300
                        ${isActive ? style.icon : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                </div>

                <span>{label}</span>

                {/* Active Indicator (Thanh nhỏ dưới cùng hoặc dấu chấm) */}
                {isActive && (
                    <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${style.indicator} animate-in zoom-in duration-300`} />
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:pl-72">
            <div className="w-[1080px] mx-auto space-y-8">
                {/* Header Section giữ nguyên */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
                     {/* ... (Code Header cũ của bạn) ... */}
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            Master Data
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Quản lý cơ sở dữ liệu nền tảng cho hệ thống hàng không.</p>
                    </div>
                    {isLoading && <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /> Đang đồng bộ dữ liệu...</div>}
                </header>

                {/* --- 3. Main Content với Tabs Thiết kế mới --- */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    
                    {/* Container TabsList: Hiệu ứng kính (Glassmorphism) nhẹ & Nổi */}
                    <div className="sticky top-4 z-10 backdrop-blur-md bg-white/80 p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <TabsList className="bg-transparent w-full flex gap-2 h-auto p-0">
                            <CustomTabTrigger value="airports" icon={Landmark} label="Quản lý Sân bay" colorKey="blue" />
                            <CustomTabTrigger value="airlines" icon={Building2} label="Hãng Hàng không" colorKey="orange" />
                            <CustomTabTrigger value="aircrafts" icon={Plane} label="Đội bay" colorKey="emerald" />
                        </TabsList>
                    </div>

                    <div className="relative min-h-[500px] animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        <TabsContent value="airports" className="focus-visible:outline-none mt-0">
                            <AirportTab data={airports} onAction={handleAction} />
                        </TabsContent>
                        <TabsContent value="airlines" className="focus-visible:outline-none mt-0">
                            <AirlineTab data={airlines} onAction={handleAction} />
                        </TabsContent>
                        <TabsContent value="aircrafts" className="focus-visible:outline-none mt-0">
                            <AircraftTab data={aircrafts} airlinesData={airlines} aircraftTypesData={aircraftTypes} onAction={handleAction} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

export default MasterDataManagementDashboard;