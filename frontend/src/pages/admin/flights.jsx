'use client'

import { useEffect, useState, useCallback } from "react"
import { Search, Plus, Plane, Edit3, XCircle, Clock, Calendar, DollarSign, Users, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/router"
import { AddFlightDialog } from "@/components/admin/AddFlightDialog"
import { EditFlightDialog } from "@/components/admin/EditFlightDialog"
import { cn } from "@/lib/utils"
import * as masterDataService from "@/services/masterDataService"

export default function ScheduledFlights() {
    const router = useRouter()

    // --- STATE ---
    const [flights, setFlights] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("")
    const [editingFlight, setEditingFlight] = useState(null)
    const [filterStatus, setFilterStatus] = useState("all")

    // --- FETCH DATA ---
    const fetchFlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await masterDataService.getAllFlights();
            // Đảm bảo data là một mảng
            setFlights(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách chuyến bay.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlights();
    }, [fetchFlights]);

    const handleRemove = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa chuyến bay này?")) return;
        try {
            const res = await masterDataService.deleteFlight(id);
            toast({ title: "Thành công", description:  `Đã xóa chuyến bay. ${res.body}` });
            fetchFlights();
        } catch (error) {
            console.log(error)
            toast({ title: "Lỗi", description: "Không thể xóa chuyến bay.", variant: "destructive" });
        }
    };

    const handleEditComplete = (updatedFlight) => {
        fetchFlights();
        setEditingFlight(null);
    };

    // --- HELPER FUNCTIONS ---
    
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return 'N/A';
            
            const timePart = date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            
            const datePart = date.toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });

            return (
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-900">{timePart}</span>
                    <span className="text-xs text-muted-foreground">{datePart}</span>
                </div>
            );
        } catch {
            return 'N/A';
        }
    };
    
    const formatPriceInMillions = (price) => {
        if (price === null || price === undefined) return 'N/A';
        const priceNumber = Number(price);
        if (isNaN(priceNumber)) return 'N/A';
        return (priceNumber / 1000000).toLocaleString('vi-VN', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
        }) + ' triệu';
    };

    // --- FILTER & DISPLAY LOGIC (FIXED FOR NESTED JSON) ---
    const filteredFlights = flights.filter(f => {
        // Truy xuất từ object schedule theo cấu trúc JSON mới
        const flightNumber = f.schedule?.flightNumber?.toLowerCase() || '';
        const aircraftTypeName = f.aircraft?.aircraftType?.typeName?.toLowerCase() || '';
        const depAirport = f.schedule?.departureAirport?.airportCode?.toLowerCase() || '';
        const arrAirport = f.schedule?.arrivalAirport?.airportCode?.toLowerCase() || '';
        const airlineName = f.schedule?.airline?.airlineName?.toLowerCase() || '';
        
        const search = searchQuery.toLowerCase();
        
        const matchesSearch = flightNumber.includes(search) ||
                             aircraftTypeName.includes(search) ||
                             depAirport.includes(search) ||
                             airlineName.includes(search) ||
                             arrAirport.includes(search);
        
        // JSON trả về status ở cấp cao nhất
        const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Scheduled', label: 'Đã Lên Lịch' },
        { value: 'OnTime', label: 'Đang Bay' },
        { value: 'Landed', label: 'Đã Hạ Cánh' },
        { value: 'Delayed', label: 'Trì Hoãn' },
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'OnTime':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">Đúng giờ</Badge>
            case 'Landed':
                return <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold">Đã hạ cánh</Badge>
            case 'Delayed':
                return <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold">Trì hoãn</Badge>
            case 'Scheduled':
            default:
                return <Badge variant="outline" className="text-gray-600 border-gray-400 font-semibold">Đã lên lịch</Badge>
        }
    }

    return (
        <div className="p-8 lg:pl-64 mx-auto bg-gray-50 min-h-screen">
            
            {/* 1. Header & Actions (Original Design) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Plane className="h-8 w-8 text-primary" /> Quản Lý Lịch Bay
                </h1>
                <div className="mt-4 md:mt-0">
                    <AddFlightDialog onSave={fetchFlights}>
                        <Button className="bg-primary hover:bg-primary/90 shadow-md text-white font-semibold text-base px-6 py-2">
                            <Plus className="h-5 w-5 mr-2" /> Thêm Chuyến Bay Mới
                        </Button>
                    </AddFlightDialog>
                </div>
            </div>

            {/* 2. Search & Filters Bar (Original Design) */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-grow max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm số hiệu, loại máy bay, sân bay..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 border-2 border-gray-200 focus:border-primary transition-colors rounded-lg shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {statusOptions.map(option => (
                        <Button
                            key={option.value}
                            variant={filterStatus === option.value ? 'default' : 'outline'}
                            onClick={() => setFilterStatus(option.value)}
                            className={cn(
                                "text-sm h-11 px-4 rounded-lg font-medium transition-all duration-200",
                                filterStatus === option.value
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                            )}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 3. Flight Table (Original Design + New Data Mapping) */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow className="hover:bg-gray-50">
                            <TableHead className="w-[100px] text-center font-bold text-gray-600">SỐ HIỆU</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">MÁY BAY & HÃNG</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">KHỞI HÀNH</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">HẠ CÁNH</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">THÔNG TIN GHẾ</TableHead>
                            <TableHead className="w-[150px] text-center font-bold text-gray-600">TRẠNG THÁI & HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredFlights.length > 0 ? (
                            filteredFlights.map((f, index) => (
                                <TableRow 
                                    key={f.schedule?.scheduleId} 
                                    className={cn("transition-colors duration-200 hover:bg-blue-50/50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                                >
                                    {/* Số hiệu - từ schedule */}
                                    <TableCell className="text-center font-extrabold text-lg text-primary">
                                        {f.schedule?.flightNumber || 'N/A'}
                                    </TableCell>
                                    
                                    {/* Máy bay & Hãng - từ aircraft & airline */}
                                    <TableCell className="text-center font-medium text-gray-800">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1">
                                                <Plane className="h-3 w-3 text-primary/70" /> 
                                                {f.aircraft?.aircraftType?.typeName || 'N/A'}
                                            </div>
                                            <span className="text-xs text-blue-600 font-bold">
                                                {f.schedule?.airline?.airlineName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Khởi hành - từ top-level & departureAirport */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {formatDateTime(f.departureDateTime)}
                                            <span className="font-semibold text-primary/80">
                                                {f.schedule?.departureAirport?.city} ({f.schedule?.departureAirport?.airportCode})
                                            </span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Hạ cánh - từ top-level & arrivalAirport */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {formatDateTime(f.arrivalDateTime)}
                                            <span className="font-semibold text-primary/80">
                                                {f.schedule?.arrivalAirport?.city} ({f.schedule?.arrivalAirport?.airportCode})
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Thông tin ghế & Thời gian bay */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-gray-700">
                                                {f.aircraft?.aircraftType?.totalSeats} Ghế
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase">
                                                Thời lượng: {f.schedule?.durationMinutes} phút
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Trạng thái & Hành động */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {getStatusBadge(f.status || 'Scheduled')}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-7"
                                                    onClick={() => setEditingFlight(f)}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" /> Sửa
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRemove(f?.flightId)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-7"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-lg text-gray-500">
                                    Không tìm thấy chuyến bay nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {editingFlight && (
                <EditFlightDialog
                    flight={editingFlight}
                    onClose={() => setEditingFlight(null)}
                    onSave={handleEditComplete}
                />
            )}
            
        </div>
    )
}