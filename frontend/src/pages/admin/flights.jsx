'use client'

import { useEffect, useState } from "react"
import { Search, Plus, Plane, Edit3, XCircle, Clock, Calendar, DollarSign, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/router"
import { AddFlightDialog } from "@/components/admin/AddFlightDialog"
import { EditFlightDialog } from "@/components/admin/EditFlightDialog"
import { cn } from "@/lib/utils" // Giả định utility cn có sẵn

export default function ScheduledFlights() {
    const router = useRouter()

    // --- MOCK DATA & STATE ---
    // Giữ nguyên logic fetching API của bạn (chỉ comment out useEffect)
    const [flights, setFlights] = useState([
        { flightId: 1, id: "QA301", aircraft: "Airbus A330", src: "HAN", dest: "SGN", ddt: "2025-11-01 08:30:00", adt: "2025-11-01 10:40:00", cec: 2500000, cbc: 5500000, noe: 180, nob: 30, status: 'Scheduled' },
        { flightId: 2, id: "QA105", aircraft: "Boeing 787", src: "DAD", dest: "HAN", ddt: "2025-11-01 12:00:00", adt: "2025-11-01 13:30:00", cec: 1800000, cbc: 4200000, noe: 200, nob: 20, status: 'OnTime' },
        { flightId: 3, id: "VN777", aircraft: "Airbus A320", src: "SGN", dest: "PQC", ddt: "2025-10-30 18:45:00", adt: "2025-10-30 20:30:00", cec: 1500000, cbc: 3000000, noe: 150, nob: 10, status: 'Landed' },
        { flightId: 4, id: "VU009", aircraft: "ATR 72", src: "HAN", dest: "VCS", ddt: "2025-11-02 06:00:00", adt: "2025-11-02 07:45:00", cec: 1200000, cbc: 2800000, noe: 60, nob: 5, status: 'Scheduled' },
        { flightId: 5, id: "QA500", aircraft: "Boeing 777", src: "HAN", dest: "DXB", ddt: "2025-11-02 23:00:00", adt: "2025-11-03 06:00:00", cec: 15000000, cbc: 35000000, noe: 150, nob: 40, status: 'Delayed' },
    ]);
    const [searchQuery, setSearchQuery] = useState("")
    const [editingFlight, setEditingFlight] = useState(null)
    const [filterStatus, setFilterStatus] = useState("all") // Bộ lọc trạng thái

    const getAllFlights = async () => { /* ... */ }
    const handleRemove = async (id) => { /* ... */ }
    const handleEditComplete = (updatedFlight) => { /* ... */ }


    // --- FILTER & DISPLAY LOGIC ---

    const filteredFlights = flights.filter(flight => {
        const matchesSearch = flight.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              flight.aircraft.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              flight.src.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              flight.dest.toLowerCase().includes(searchQuery.toLowerCase());
        
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

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const [date, time] = dateTimeString.split(' ');
        const timePart = time.slice(0, 5); // Lấy HH:MM
        const datePart = date.slice(2, 10).split('-').reverse().join('/'); // Lấy YY/MM/DD
        return (
            <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900">{timePart}</span>
                <span className="text-xs text-muted-foreground">{datePart}</span>
            </div>
        );
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
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow className="hover:bg-gray-50">
                            <TableHead className="w-[100px] text-center font-bold text-gray-600">SỐ HIỆU</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">MÁY BAY</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">KHỞI HÀNH (Giờ/Sân bay)</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 min-w-[150px]">HẠ CÁNH (Giờ/Sân bay)</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">GHẾ & GIÁ PHỔ THÔNG</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">GHẾ & GIÁ THƯƠNG GIA</TableHead>
                            <TableHead className="w-[150px] text-center font-bold text-gray-600">TRẠNG THÁI & HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFlights.length > 0 ? (
                            filteredFlights.map((flight, index) => (
                                <TableRow 
                                    key={flight.flightId} 
                                    className={cn("transition-colors duration-200 hover:bg-blue-50/50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                                >
                                    {/* Số hiệu */}
                                    <TableCell className="text-center font-extrabold text-lg text-primary">{flight.id}</TableCell>
                                    
                                    {/* Loại máy bay */}
                                    <TableCell className="text-center font-medium text-gray-800 flex items-center justify-center gap-2">
                                        <Plane className="h-4 w-4 text-primary/70" /> {flight.aircraft}
                                    </TableCell>
                                    
                                    {/* Khởi hành */}
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary/70" />
                                            {formatDateTime(flight.ddt)}
                                            <span className="font-semibold text-primary/80">({flight.src})</span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Hạ cánh */}
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock className="h-4 w-4 text-primary/70" />
                                            {formatDateTime(flight.adt)}
                                            <span className="font-semibold text-primary/80">({flight.dest})</span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Phổ thông */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-green-600">{`${flight.cec.toLocaleString('vi-VN')} VND`}</span>
                                            <span className="text-sm text-muted-foreground">{`x ${flight.noe} ghế`}</span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Thương gia */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-red-600">{`${flight.cbc.toLocaleString('vi-VN')} VND`}</span>
                                            <span className="text-sm text-muted-foreground">{`x ${flight.nob} ghế`}</span>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Trạng thái & Hành động */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {getStatusBadge(flight)}
                                            {flight.status === 'Scheduled' && (
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
                                                        onClick={() => handleRemove(flight.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-7"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Hủy
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-lg text-gray-500">
                                    Không tìm thấy chuyến bay nào phù hợp với điều kiện tìm kiếm.
                                </TableCell>
                            </TableRow>
                        )}
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