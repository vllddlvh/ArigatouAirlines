import React from 'react';
import { 
    Loader2, 
    Ticket, 
    Plane, 
    CalendarDays, 
    MapPin, 
    PlaneTakeoff,
    PlaneLanding
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';

export const FlightListManagement = ({ flights, onFlightClick, isLoading }) => {
    
    // Tách hàm format để lấy riêng Giờ và Ngày
    const getDateTimeParts = (dateString) => {
        if (!dateString) return { time: '--:--', date: '--/--/----' };
        const date = new Date(dateString);
        return {
            time: date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        };
    };

    return (
        <div className="space-y-4">
            {/* Header của Section */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Danh sách Chuyến bay</h2>
                    <p className="text-sm text-gray-500">Quản lý lịch trình và trạng thái vé</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-white">
                    Total: {flights.length}
                </Badge>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm bg-white ring-1 ring-gray-100">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-100">
                            <TableHead className="w-[200px] py-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Chuyến bay
                            </TableHead>
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <PlaneTakeoff className="w-4 h-4" /> Khởi hành
                                </div>
                            </TableHead>
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <PlaneLanding className="w-4 h-4" /> Hạ cánh
                                </div>
                            </TableHead>
                            <TableHead className="text-center w-[120px] py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Tổng ghế
                            </TableHead>
                            <TableHead className="text-center w-[120px] py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col justify-center items-center gap-2 text-gray-500">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" /> 
                                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : flights.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Plane className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Không tìm thấy chuyến bay nào.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            flights.map((flight) => {
                                // --- TRUY XUẤT DỮ LIỆU TỪ JSON LỒNG NHAU ---
                                const schedule = flight.schedule || {};
                                const aircraft = flight.aircraft || {};
                                const depTime = flight.departureDateTime || schedule.departureTime;
                                const arrTime = flight.arrivalDateTime || schedule.arrivalTime;
                                
                                const dep = getDateTimeParts(depTime);
                                const arr = getDateTimeParts(arrTime);
                                
                                const flightNumber = schedule.flightNumber || "N/A";
                                const totalSeats = aircraft.aircraftType?.totalSeats || 0;
                                const depCity = schedule.departureAirport?.city || "Unknown";
                                const arrCity = schedule.arrivalAirport?.city || "Unknown";
                                const airlineCode = schedule.airline?.airlineCode || "";

                                return (
                                    <TableRow key={flight.flightId} className="group hover:bg-blue-50/30 transition-all border-b border-gray-50 last:border-0">
                                        {/* Cột 1: Số hiệu chuyến bay */}
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <Plane className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">{flightNumber}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        Code: {flight.flightId} • {airlineCode}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Cột 2: Khởi hành */}
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    {dep.time}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <CalendarDays className="w-3 h-3" /> {dep.date}
                                                </div>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 w-fit mt-1">
                                                    <MapPin className="w-3 h-3 mr-1" /> {depCity}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Cột 3: Hạ cánh */}
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    {arr.time}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <CalendarDays className="w-3 h-3" /> {arr.date}
                                                </div>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 w-fit mt-1">
                                                    <MapPin className="w-3 h-3 mr-1" /> {arrCity}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Cột 4: Tổng ghế */}
                                        <TableCell className="text-center py-4">
                                            <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 border border-gray-200 min-w-[60px]">
                                                <span className="text-xl font-bold text-gray-700 leading-none">{totalSeats}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Ghế</span>
                                            </div>
                                        </TableCell>

                                        {/* Cột 5: Hành động */}
                                        <TableCell className="text-center py-4">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                onClick={() => onFlightClick(flight)}
                                            >
                                                <Ticket className="w-4 h-4 mr-1.5" /> Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};