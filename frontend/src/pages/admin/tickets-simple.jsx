import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Ticket, User, Plane, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table-admin';
import { useToast } from '@/hooks/use-toast';
import { getAllTickets } from '@/services/ticketService';

function TicketManagement() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllTickets();
            setTickets(data || []);
        } catch (error) {
            toast({
                title: "Có lỗi khi lấy dữ liệu!",
                description: error.response?.data?.message || "Xin vui lòng thử lại",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllTickets();
    }, [fetchAllTickets]);

    const filteredTickets = tickets.filter(t => 
        (t.booking?.bookingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.passenger?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.flight?.schedule?.flightNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return amount ? Number(amount).toLocaleString('vi-VN') + '₫' : '0₫';
    };

    const getStatusBadge = (ticket) => {
        // Determine status based on booking status
        const bookingStatus = ticket.booking?.statusBooking;
        if (bookingStatus === 'Cancelled') {
            return <Badge variant="destructive">Đã hủy</Badge>;
        }
        if (bookingStatus === 'Confirmed') {
            return <Badge variant="success">Đã xác nhận</Badge>;
        }
        return <Badge variant="warning">Chờ xác nhận</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Ticket className="w-7 h-7 text-blue-600" />
                        <span>Quản Lý Vé Máy Bay</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi và quản lý tất cả vé đã được đặt trong hệ thống.</p>
                </header>

                {/* Search Bar */}
                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex justify-between items-center mb-6">
                    <div className="flex w-full max-w-md space-x-2">
                        <Input
                            placeholder="Tìm kiếm theo mã booking, tên hành khách, số hiệu bay..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow"
                        />
                        <Button variant="primary">
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                        Tổng số vé: <span className="font-bold text-blue-600">{tickets.length}</span>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                            <span className="text-lg font-medium">Đang tải danh sách vé...</span>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableHead className="w-[10%]">MÃ BOOKING</TableHead>
                                    <TableHead className="w-[15%]">SỐ HIỆU BAY</TableHead>
                                    <TableHead className="w-[15%]">HÀNH KHÁCH</TableHead>
                                    <TableHead className="w-[10%]">GHẾ</TableHead>
                                    <TableHead className="w-[15%]">TUYẾN BAY</TableHead>
                                    <TableHead className="w-[10%]">NGÀY BAY</TableHead>
                                    <TableHead className="w-[12%]">GIÁ VÉ</TableHead>
                                    <TableHead className="w-[13%] text-center">TRẠNG THÁI</TableHead>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                                Không tìm thấy vé nào.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTickets.map((ticket, index) => (
                                            <TableRow 
                                                key={ticket.ticketId || index}
                                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                            >
                                                <TableCell className="font-semibold text-indigo-700">
                                                    {ticket.booking?.bookingCode || 'N/A'}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {ticket.flight?.schedule?.flightNumber || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span>{ticket.passenger?.fullName || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono font-bold text-blue-600">
                                                    {ticket.flightSeat?.seatMap?.seatNumber || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <span>{ticket.flight?.schedule?.departureAirport?.airportCode || 'N/A'}</span>
                                                        <Plane className="w-3 h-3 text-gray-400" />
                                                        <span>{ticket.flight?.schedule?.arrivalAirport?.airportCode || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {ticket.flight?.flightDate 
                                                                ? new Date(ticket.flight.flightDate).toLocaleDateString('vi-VN')
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1 font-semibold text-green-600">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>
                                                            {formatCurrency(
                                                                ticket.flightPrice?.basePrice 
                                                                    ? Number(ticket.flightPrice.basePrice) + Number(ticket.flightPrice.tax || 0)
                                                                    : 0
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(ticket)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketManagement;
