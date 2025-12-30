'use client'

import { useEffect, useState, useCallback } from "react"
import { 
  Search, Plus, Plane, Edit3, Trash2, 
  MapPin, CalendarDays, Armchair, Filter, RefreshCw 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { AddFlightDialog } from "@/components/admin/AddFlightDialog"
import { EditFlightDialog } from "@/components/admin/EditFlightDialog"
import { cn } from "@/lib/utils"
import * as masterDataService from "@/services/masterDataService"

export default function ScheduledFlights() {

    const [flights, setFlights] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("")
    const [editingFlight, setEditingFlight] = useState(null)
    const [filterStatus, setFilterStatus] = useState("all")

    const fetchFlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await masterDataService.getAllFlights();
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
            toast({ title: "Thành công", description:  `Đã xóa chuyến bay` });
            fetchFlights();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa chuyến bay.", variant: "destructive" });
        }
    };

    const handleEditComplete = (updatedFlight) => {
        fetchFlights();
        setEditingFlight(null);
    };

    // --- HELPER FUNCTIONS (CẢI TIẾN HIỂN THỊ) ---
    
    // Tách giờ và ngày để hiển thị đẹp hơn
    const splitDateTime = (dateTimeString) => {
        if (!dateTimeString) return { time: '--:--', date: '--/--/----' };
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return { time: '--:--', date: '--/--/----' };
            
            const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
            const datePart = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return { time: timePart, date: datePart };
        } catch {
            return { time: '--:--', date: '--/--/----' };
        }
    };

    // --- FILTER LOGIC (GIỮ NGUYÊN) ---
    const filteredFlights = flights.filter(f => {
        const flightNumber = f.schedule?.flightNumber?.toLowerCase() || '';
        const aircraftTypeName = f.aircraft?.aircraftType?.typeName?.toLowerCase() || '';
        const depAirport = f.schedule?.departureAirport?.airportCode?.toLowerCase() || '';
        const arrAirport = f.schedule?.arrivalAirport?.airportCode?.toLowerCase() || '';
        const airlineName = f.schedule?.airline?.airlineName?.toLowerCase() || '';
        
        const search = searchQuery.toLowerCase();
        const matchesSearch = flightNumber.includes(search) || aircraftTypeName.includes(search) || depAirport.includes(search) || airlineName.includes(search) || arrAirport.includes(search);
        const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusConfig = {
        'OnTime': { label: 'Đúng giờ', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
        'Landed': { label: 'Đã hạ cánh', className: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
        'Delayed': { label: 'Trì hoãn', className: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
        'Scheduled': { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig['Scheduled'];
        return (
            <Badge variant="outline" className={cn("px-3 py-1 font-medium border", config.className)}>
                <span className={cn("mr-1.5 h-2 w-2 rounded-full", config.className.replace('bg-', 'bg-current opacity-60'))} />
                {config.label}
            </Badge>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:pl-72 pt-8">
            <div className="w-[1080px] mx-auto space-y-6">
                
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Lịch Bay</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Xem và quản lý tất cả các chuyến bay hiện có trong hệ thống.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={fetchFlights} className="hidden sm:flex">
                            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                            Làm mới
                        </Button>
                        <AddFlightDialog onSave={fetchFlights}>
                            <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                                <Plus className="h-4 w-4 mr-2" /> Thêm Chuyến Bay
                            </Button>
                        </AddFlightDialog>
                    </div>
                </div>

                {/* 2. Main Card Content */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                            
                            {/* Search Bar */}
                            <div className="relative w-full md:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm kiếm chuyến bay..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                                        <SelectItem value="OnTime">Đang bay</SelectItem>
                                        <SelectItem value="Delayed">Bị hoãn</SelectItem>
                                        <SelectItem value="Landed">Đã hạ cánh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead className="w-[180px] font-semibold text-slate-700">Chuyến bay / Hãng</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Lộ trình (Đi <span className="text-slate-400 px-1">→</span> Đến)</TableHead>
                                    <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Máy bay</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 pr-6">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5} className="h-16">
                                                <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredFlights.length > 0 ? (
                                    filteredFlights.map((f) => {
                                        const dep = splitDateTime(f.departureDateTime);
                                        const arr = splitDateTime(f.arrivalDateTime);
                                        
                                        return (
                                            <TableRow key={f.flightId} className="group hover:bg-slate-50/50 transition-colors">
                                                {/* Cột 1: Thông tin chuyến bay & Hãng */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                                                <Plane className="h-4 w-4 transform -rotate-45" />
                                                            </div>
                                                            <span className="font-bold text-slate-900 text-base">
                                                                {f.schedule?.flightNumber || '---'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium pl-10">
                                                            {f.schedule?.airline?.airlineName}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Cột 2: Lộ trình (Ghép Đi & Đến cho dễ nhìn flow) */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex items-start gap-6">
                                                        {/* Đi */}
                                                        <div className="flex flex-col min-w-[100px]">
                                                            <span className="text-xl font-bold text-slate-800 leading-none mb-1">
                                                                {dep.time}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs uppercase font-semibold">
                                                                <span className="text-primary bg-primary/10 px-1 rounded">
                                                                    {f.schedule?.departureAirport?.airportCode}
                                                                </span>
                                                                {f.schedule?.departureAirport?.city}
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 mt-1 flex items-center">
                                                                <CalendarDays className="h-3 w-3 mr-1" /> {dep.date}
                                                            </span>
                                                        </div>

                                                        {/* Icon mũi tên / Thời lượng */}
                                                        <div className="hidden sm:flex flex-col items-center justify-center pt-1 px-2">
                                                            <div className="w-20 h-[1px] bg-slate-300 relative">
                                                                <div className="absolute -right-1 -top-1 h-2 w-2 border-t border-r border-slate-300 rotate-45" />
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 mt-1 font-medium whitespace-nowrap">
                                                                {f.schedule?.durationMinutes} phút
                                                            </span>
                                                        </div>

                                                        {/* Đến */}
                                                        <div className="flex flex-col min-w-[100px]">
                                                            <span className="text-xl font-bold text-slate-800 leading-none mb-1">
                                                                {arr.time}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs uppercase font-semibold">
                                                                <span className="text-primary bg-primary/10 px-1 rounded">
                                                                    {f.schedule?.arrivalAirport?.airportCode}
                                                                </span>
                                                                {f.schedule?.arrivalAirport?.city}
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 mt-1 flex items-center">
                                                                <CalendarDays className="h-3 w-3 mr-1" /> {arr.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Cột 3: Máy bay */}
                                                <TableCell className="align-top py-4 hidden md:table-cell">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {f.aircraft?.aircraftType?.typeName || 'Chưa gán'}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Armchair className="h-3 w-3" />
                                                            {f.aircraft?.aircraftType?.totalSeats} ghế
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Cột 4: Trạng thái */}
                                                <TableCell className="align-top py-4">
                                                    {getStatusBadge(f.status || 'Scheduled')}
                                                </TableCell>

                                                {/* Cột 5: Hành động */}
                                                <TableCell className="align-top py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => setEditingFlight(f)}
                                                                    >
                                                                        <Edit3 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Chỉnh sửa</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleRemove(f?.flightId)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Hủy chuyến</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                    <Plane className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <p className="text-lg font-medium">Không tìm thấy chuyến bay nào</p>
                                                <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {editingFlight && (
                    <EditFlightDialog
                        flight={editingFlight}
                        onClose={() => setEditingFlight(null)}
                        onSave={handleEditComplete}
                    />
                )}
            </div>
        </div>
    )
}