import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Plane, CheckCircle, XCircle, DollarSign, RotateCcw, Ticket, UserX } from 'lucide-react';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog-admin';
import { Table,TableHead,TableHeader } from '@/components/ui/table-admin';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAllBookings, confirmPayment, cancelBooking } from '@/services/bookingService';




// ===========================================
// MAIN COMPONENT
// ===========================================

function BookingManagementDashboard() {
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- Lấy danh sách Booking từ Backend ---
    const fetchAllBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllBookings();
            setBookings(data || []);
        } catch (error) {
            toast({
                title: "Có lỗi khi lấy dữ liệu!",
                description: error.response?.data?.message || "Xin vui lòng thử lại trong giây lát",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // --- Hủy Booking ---
    const handleCancelBooking = async (bookingCode) => {
        if (!window.confirm(`Bạn có chắc chắn muốn HỦY Booking ${bookingCode}? Thao tác này không thể hoàn tác.`)) return;
        
        try {
            const booking = bookings.find(b => b.bookingCode === bookingCode);
            if (!booking) return;
            
            await cancelBooking(booking.bookingId || booking.id);
            await fetchAllBookings();
            
            toast({ 
                title: "Thành công", 
                description: `Booking ${bookingCode} đã được hủy.`, 
                variant: "destructive" 
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể hủy booking",
                variant: "destructive"
            });
        }
    };

    // --- Xác nhận Thanh toán ---
    const handleConfirmPayment = async (bookingCode) => {
        try {
            const booking = bookings.find(b => b.bookingCode === bookingCode);
            if (!booking) return;
            
            await confirmPayment(booking.bookingId || booking.id);
            await fetchAllBookings();
            
            toast({ 
                title: "Thành công", 
                description: `Booking ${bookingCode} đã được xác nhận thanh toán.`, 
                variant: "success" 
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể xác nhận thanh toán",
                variant: "destructive"
            });
        }
    };
    
    // --- Logic UI ---
    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDialogOpen(true);
    };

    const filteredBookings = bookings.filter(b => 
        (b.bookingCode || b.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.user?.fullName || b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (statusBooking, statusPayment) => {
        if (statusBooking === 'Cancelled') {
            return <Badge variant="destructive">Đã hủy</Badge>;
        }
        if (statusBooking === 'Confirmed' && statusPayment === 'Paid') {
            return <Badge variant="success">Đã xác nhận</Badge>;
        }
        if (statusBooking === 'Pending' || statusPayment === 'Pending') {
            return <Badge variant="warning">Chờ thanh toán</Badge>;
        }
        return <Badge variant="default">{statusBooking}</Badge>;
    };
    
    // Custom Table Row component
    const BookingTableRow = ({ booking }) => {
        const isCancelled = booking.statusBooking === 'Cancelled';
        const isConfirmed = booking.statusBooking === 'Confirmed' && booking.statusPayment === 'Paid';
        
        return (
            <div 
                key={booking.bookingCode || booking.id}
                className={`grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr] items-center p-4 border-b transition-colors text-sm
                    ${isCancelled ? 'bg-red-50 opacity-80' : 'hover:bg-indigo-50'}`}
            >
                <div className={`font-semibold ${isCancelled ? 'text-red-600' : 'text-indigo-700'}`}>{booking.bookingCode || booking.id}</div>
                <div className="text-gray-700 truncate">{booking.user?.fullName || booking.customerName || 'N/A'}</div>
                <div className="text-gray-600 font-medium">{booking.user?.email || booking.customerEmail || 'N/A'}</div>
                <div className="font-bold text-green-700">
                    {Number(booking.totalAmount || booking.totalPrice || 0).toLocaleString('vi-VN')}₫
                </div>
                <div className="flex justify-center">{getStatusBadge(booking.statusBooking || booking.status, booking.statusPayment)}</div>
                
                {/* Actions Cell */}
                <div className="flex space-x-2 justify-center">
                    <Button 
                        variant="indigo" 
                        size="sm"
                        title="Xem chi tiết"
                        onClick={() => handleViewDetails(booking)}
                    >
                        Chi tiết
                    </Button>
                    
                    {/* Hành động chính trong bảng */}
                    {(booking.statusBooking === 'Pending' || booking.status === 'Pending') && (
                        <Button 
                            variant="success" 
                            size="sm"
                            title="Xác nhận thanh toán"
                            onClick={() => handleConfirmPayment(booking.bookingCode || booking.id)}
                        >
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                    )}
                    
                    {(booking.statusBooking !== 'Cancelled' && booking.status !== 'Cancelled') && (
                        <Button 
                            variant="destructive" 
                            size="sm"
                            title="Hủy Booking"
                            onClick={() => handleCancelBooking(booking.bookingCode || booking.id)}
                            className={(booking.statusBooking === 'Confirmed' || booking.status === 'Confirmed') ? 'bg-red-500' : ''}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen max-w-[1280px] bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Plane className="w-7 h-7 text-indigo-600" />
                        <span>Quản Lý Đặt Chỗ (Booking)</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi, xác nhận và quản lý các giao dịch đặt vé máy bay.</p>
                </header>

                {/* Search Bar */}
                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="flex w-full sm:w-auto space-x-2">
                        <Input
                            placeholder="Tìm kiếm theo Mã Booking, Tên KH, Số hiệu bay..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md placeholder:text-gray-400 flex-grow w-full p-2.5 border rounded-lg focus:outline-none transition-shadow duration-200 text-gray-800 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Button variant="primary" className="p-2 h-10 w-10 sm:w-auto">
                            <Search className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Tìm</span>
                        </Button>
                    </div>
                </div>

                {/* Booking List Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                            <span className="text-lg font-medium">Đang tải danh sách booking...</span>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[900px]"> 
                                {/* Table Header (Using Grid) */}
                                <TableHeader>
                                    <TableHead className="w-[15%]">MÃ BOOKING</TableHead>
                                    <TableHead className="w-[20%]">KHÁCH HÀNG</TableHead>
                                    <TableHead className="w-[15%]">EMAIL</TableHead>
                                    <TableHead className="w-[15%]">TỔNG TIỀN</TableHead>
                                    <TableHead className="w-[15%] text-center">TRẠNG THÁI</TableHead>
                                    <TableHead className="w-[20%] text-center">THAO TÁC</TableHead>
                                </TableHeader>
                            </div>
                            
                            <div className="min-w-[900px]">
                                {filteredBookings.length === 0 ? (
                                    <div className="h-32 flex flex-col items-center justify-center text-gray-500 p-4">
                                        <UserX className="w-6 h-6 mb-2" />
                                        <span className="text-base">Không tìm thấy đơn đặt chỗ nào.</span>
                                    </div>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <BookingTableRow key={booking.id} booking={booking} />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dialog Chi tiết Booking */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Chi tiết Booking: {selectedBooking?.bookingCode || selectedBooking?.id}</DialogTitle>
                            <DialogDescription>
                                Mã booking: <span className="font-semibold text-indigo-600">{selectedBooking?.bookingCode || selectedBooking?.id}</span> | Ngày tạo: {selectedBooking?.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString('vi-VN') : selectedBooking?.bookingDate}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t mt-4">
                                {/* Cột 1: Thông tin khách hàng */}
                                <DetailCard title="Thông tin Khách hàng">
                                    <DetailItem label="Tên" value={selectedBooking.user?.fullName || selectedBooking.customerName || 'N/A'} />
                                    <DetailItem label="Email" value={selectedBooking.user?.email || selectedBooking.customerEmail || 'N/A'} />
                                    <DetailItem label="Trạng thái" value={getStatusBadge(selectedBooking.statusBooking || selectedBooking.status, selectedBooking.statusPayment)} isBadge={true} />
                                </DetailCard>

                                {/* Cột 2: Thông tin thanh toán */}
                                <DetailCard title="Thông tin Thanh toán">
                                    <DetailItem 
                                        label="Tổng tiền" 
                                        value={<span className="text-xl font-bold text-green-600">{Number(selectedBooking.totalAmount || selectedBooking.totalPrice || 0).toLocaleString('vi-VN')}₫</span>} 
                                    />
                                    <DetailItem label="Hạn thanh toán" value={selectedBooking.paymentDeadline ? new Date(selectedBooking.paymentDeadline).toLocaleString('vi-VN') : 'N/A'} />
                                    <DetailItem 
                                        label="Tình trạng" 
                                        value={selectedBooking.statusPayment === 'Paid' ? 'Đã thanh toán' : selectedBooking.statusPayment === 'Pending' ? 'Chưa thanh toán' : selectedBooking.statusPayment === 'Refunded' ? 'Đã hoàn tiền' : 'Thất bại'} 
                                    />
                                </DetailCard>

                                {/* Cột 3: Hành động */}
                                <DetailCard title="Hành động Quản lý">
                                    <div className="space-y-3">
                                        {(selectedBooking.statusBooking === 'Pending' || selectedBooking.status === 'Pending') && (
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={() => handleConfirmPayment(selectedBooking.bookingCode || selectedBooking.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận Thanh toán
                                            </Button>
                                        )}
                                        {(selectedBooking.statusBooking !== 'Cancelled' && selectedBooking.status !== 'Cancelled') && (
                                            <Button 
                                                className="w-full bg-red-600 hover:bg-red-700"
                                                onClick={() => handleCancelBooking(selectedBooking.bookingCode || selectedBooking.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Hủy Booking
                                            </Button>
                                        )}
                                        {(selectedBooking.statusBooking === 'Cancelled' || selectedBooking.status === 'Cancelled') && (
                                            <p className="text-red-500 font-medium p-2 bg-red-50 rounded-lg border border-red-200">
                                                <RotateCcw className="w-4 h-4 inline mr-2"/> Không thể thao tác trên Booking đã hủy.
                                            </p>
                                        )}
                                    </div>
                                </DetailCard>
                            </div>
                        )}
                        
                        {/* Ticket Details Section */}
                        {selectedBooking?.tickets && selectedBooking.tickets.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-bold text-lg text-indigo-700 mb-3">Chi tiết vé</h3>
                                <div className="space-y-3">
                                    {selectedBooking.tickets.map((ticket, idx) => (
                                        <div key={ticket.ticketId || idx} className="bg-gray-50 p-3 rounded-lg border">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Hành khách:</span>
                                                    <div className="font-semibold">{ticket.passengerName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Chuyến bay:</span>
                                                    <div className="font-semibold">{ticket.flightNumber || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Hạng vé:</span>
                                                    <div className="font-semibold text-indigo-600">
                                                        {ticket.ticketClassName === 'ECONOMY' ? 'Phổ thông' : 
                                                         ticket.ticketClassName === 'PREMIUM_ECONOMY' ? 'Premium Economy' : 
                                                         ticket.ticketClassName === 'BUSINESS' ? 'Thương gia' : ticket.ticketClassName}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Ghế:</span>
                                                    <div className="font-semibold">{ticket.seatNumber || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Giá vé:</span>
                                                    <div className="font-bold text-green-600">
                                                        {Number(ticket.basePrice || 0).toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Thuế/phí:</span>
                                                    <div className="font-semibold">
                                                        {Number(ticket.tax || 0).toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Tổng:</span>
                                                    <div className="font-bold text-blue-600">
                                                        {(Number(ticket.basePrice || 0) + Number(ticket.tax || 0)).toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Trạng thái:</span>
                                                    <div className="font-semibold">{ticket.status || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// --- Helper Components ---
const DetailCard = ({ title, children }) => (
    <div className="space-y-3 col-span-1 p-3 rounded-lg border">
        <h3 className="font-bold text-lg text-indigo-700 mb-3 border-b pb-2">{title}</h3>
        {children}
    </div>
);

const DetailItem = ({ label, value, isBadge = false }) => (
    <div className="flex justify-between items-center pb-1">
        <span className="text-gray-600 font-medium">{label}:</span>
        {isBadge ? value : <span className="text-gray-800 font-semibold">{value}</span>}
    </div>
);


// Export as App is required for the single-file React component convention
export default BookingManagementDashboard;