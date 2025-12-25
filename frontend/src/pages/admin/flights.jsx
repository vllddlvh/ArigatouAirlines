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
            console.log('Dữ liệu chuyến bay từ API:', data);
            setFlights(data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách chuyến bay:", error);
            console.error("Chi tiết lỗi:", error.response);
            console.error("URL API:", process.env.NEXT_PUBLIC_API_BASE_URL);
            console.error("Token trong localStorage:", localStorage.getItem("token"));
            toast({
                title: "Lỗi",
                description: `Không thể tải danh sách chuyến bay. ${error.response?.data?.message || error.message}`,
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
            await masterDataService.deleteFlight(id);
            toast({ title: "Thành công", description: "Đã xóa chuyến bay." });
            fetchFlights();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa chuyến bay.", variant: "destructive" });
        }
    };

    const handleEditComplete = (updatedFlight) => {
        fetchFlights();
        setEditingFlight(null);
    };


    // --- HELPER FUNCTIONS ---
    
    // Định dạng thời gian
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return 'N/A';
            
            // Định dạng giờ:phút (24h)
            const timePart = date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            
            // Định dạng ngày/tháng/năm
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
    
    // Định dạng giá theo triệu đồng
    const formatPriceInMillions = (price) => {
        if (price === null || price === undefined) return 'N/A';
        
        // Nếu giá là chuỗi, xóa các ký tự không phải số
        const cleanPrice = typeof price === 'string' 
            ? price.replace(/\D/g, '') 
            : price;
        
        const priceNumber = Number(cleanPrice);
        if (isNaN(priceNumber)) return 'N/A';
        
        // Định dạng thành triệu đồng
        return (priceNumber / 1000000).toLocaleString('vi-VN', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
        }) + ' triệu';
    };

    // --- FILTER & DISPLAY LOGIC ---

    const filteredFlights = flights.filter(flight => {
        const flightNumber = flight.flightNumber?.toLowerCase() || '';
        const aircraftType = flight.aircraftType?.toLowerCase() || '';
        const departureAirport = flight.departureAirportCode?.toLowerCase() || '';
        const arrivalAirport = flight.arrivalAirportCode?.toLowerCase() || '';
        const search = searchQuery.toLowerCase();
        
        const matchesSearch = flightNumber.includes(search) ||
                              aircraftType.includes(search) ||
                              departureAirport.includes(search) ||
                              arrivalAirport.includes(search);
        
        const matchesStatus = filterStatus === 'all' || flight.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Scheduled', label: 'Đã Lên Lịch' },
        { value: 'OnTime', label: 'Đang Bay' },
        { value: 'Landed', label: 'Đã Hạ Cánh' },
        { value: 'Delayed', label: 'Trì Hoãn' },
    ];

    const getStatusBadge = (flight) => {
        switch(flight.status) {
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

        
    // --- RENDER COMPONENT ---
    return (
        <div className="p-8 lg:pl-64 mx-auto bg-gray-50 min-h-screen">
            
            {/* 1. Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Plane className="h-8 w-8 text-primary" /> Quản Lý Lịch Bay
                </h1>
                <div className="mt-4 md:mt-0">
                    <AddFlightDialog>
                        <Button className="bg-primary hover:bg-primary/90 shadow-md text-white font-semibold text-base px-6 py-2">
                            <Plus className="h-5 w-5 mr-2" /> Thêm Chuyến Bay Mới
                        </Button>
                    </AddFlightDialog>
                </div>
            </div>

            {/* 2. Search & Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                
                {/* Search Input */}
                <div className="relative flex-grow max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo số hiệu, loại máy bay, Sân bay đi/đến..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 border-2 border-gray-200 focus:border-primary transition-colors rounded-lg shadow-sm"
                    />
                </div>

                {/* Status Filter Dropdowns (Styled as buttons) */}
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

            {/* 3. Flight Table */}
            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow className="hover:bg-gray-50">
                            <TableHead className="w-[100px] text-center font-bold text-gray-600">SỐ HIỆU</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">MÁY BAY</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">KHỞI HÀNH</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">HẠ CÁNH</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[120px]">HẠNG PHỔ THÔNG</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[120px]">HẠNG THƯƠNG GIA</TableHead>
                            <TableHead className="w-[150px] text-center font-bold text-gray-600">TRẠNG THÁI & HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isLoading && filteredFlights.length > 0 ? (
                            filteredFlights.map((flight, index) => (
                                <TableRow 
                                    key={flight.scheduleId} 
                                    className={cn("transition-colors duration-200 hover:bg-blue-50/50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                                >
                                    {/* Số hiệu */}
                                    <TableCell className="text-center font-extrabold text-lg text-primary">
                                        {flight.flightNumber || 'N/A'}
                                    </TableCell>
                                    
                                    {/* Loại máy bay */}
                                    <TableCell className="text-center font-medium text-gray-800">
                                        <div className="flex items-center justify-center gap-2">
                                            <Plane className="h-4 w-4 text-primary/70" /> 
                                            {flight.aircraftType || 'N/A'}
                                        </div>
                                    </TableCell>
                                    
                                    {/* Khởi hành */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary/70" />
                                                {formatDateTime(flight.departureTime)}
                                            </div>
                                            <span className="font-semibold text-primary/80">
                                                {flight.departureCity || ''} ({flight.departureAirportCode || 'N/A'})
                                            </span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Hạ cánh */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary/70" />
                                                {formatDateTime(flight.arrivalTime)}
                                            </div>
                                            <span className="font-semibold text-primary/80">
                                                {flight.arrivalCity || ''} ({flight.arrivalAirportCode || 'N/A'})
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Giá hạng phổ thông */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-green-600">
                                                {formatPriceInMillions(flight.prices?.ECONOMY || flight.basePrice)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Phổ thông</span>
                                        </div>
                                    </TableCell>

                                    {/* Giá hạng thương gia */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-blue-600">
                                                {flight.prices?.BUSINESS 
                                                    ? formatPriceInMillions(flight.prices.BUSINESS)
                                                    : flight.basePrice 
                                                        ? formatPriceInMillions(flight.basePrice * 1.5)
                                                        : 'N/A'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Thương gia</span>
                                        </div>
                                    </TableCell>

                                    {/* Trạng thái & Hành động */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {getStatusBadge(flight)}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-7"
                                                    onClick={() => setEditingFlight(flight)}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" /> Sửa
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRemove(flight.scheduleId)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-7"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-lg text-gray-500">
                                    Không tìm thấy chuyến bay nào phù hợp với điều kiện tìm kiếm.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>
            
            {/* Edit Dialog (Modal) */}
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