import React, { useState, useEffect, useCallback } from 'react';
// Icons from Lucide
import { Search, Loader2, Plane, CheckCircle, XCircle, DollarSign, RotateCcw, Ticket, UserX } from 'lucide-react';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog-admin';
import { Table,TableHead,TableHeader } from '@/components/ui/table-admin';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';




// ===========================================
// MOCK DATA & MAIN COMPONENT
// ===========================================

// --- Dữ liệu Mock (Giả) ---
const MOCK_BOOKINGS = [
    {
        id: 'BKG001',
        flightNumber: 'VN1234',
        customerName: 'Nguyễn Văn An',
        customerEmail: 'an.nv@example.com',
        totalPrice: 4700000,
        status: 'Pending', // Trạng thái: Pending, Confirmed, Cancelled
        paymentMethod: 'Bank Transfer',
        bookingDate: '2025-10-20',
        tickets: [
            { id: 'T1', seat: 'A01', class: 'Business', price: 3500000 },
            { id: 'T2', seat: 'B02', class: 'Economy', price: 1200000 }
        ]
    },
    {
        id: 'BKG002',
        flightNumber: 'VJ5678',
        customerName: 'Trần Thị Bình',
        customerEmail: 'binh.tt@example.com',
        totalPrice: 1550000,
        status: 'Confirmed',
        paymentMethod: 'Credit Card',
        bookingDate: '2025-10-25',
        tickets: [{ id: 'T3', seat: 'C10', class: 'Economy', price: 1550000 }]
    },
    {
        id: 'BKG003',
        flightNumber: 'QH9012',
        customerName: 'Lê Văn Cường',
        customerEmail: 'cuong.lv@example.com',
        totalPrice: 2000000,
        status: 'Cancelled',
        paymentMethod: 'Cash',
        bookingDate: '2025-10-18',
        tickets: [{ id: 'T4', seat: 'D05', class: 'Economy', price: 2000000 }]
    }
];
// ----------------------------

function BookingManagementDashboard() {
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- Mock: Lấy danh sách Booking ---
    const getAllBookings = useCallback(async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        try {
            setBookings(MOCK_BOOKINGS);
        } catch (error) {
            toast({
                title: "Có lỗi khi lấy dữ liệu!",
                description: "Xin vui lòng thử lại trong giây lát",
            })
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // --- Mock: Hủy Booking ---
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn HỦY Booking ${bookingId}? Thao tác này không thể hoàn tác.`)) return;
        
        await new Promise(resolve => setTimeout(resolve, 500));

        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, status: 'Cancelled' } : b
        ));
        setSelectedBooking(prev => ({ ...prev, status: 'Cancelled' }));

        toast({ title: "Thành công", description: `Booking ${bookingId} đã được hủy.`, variant: "destructive" })
    };

    // --- Mock: Xác nhận Thanh toán ---
    const handleConfirmPayment = async (bookingId) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, status: 'Confirmed' } : b
        ));
        setSelectedBooking(prev => ({ ...prev, status: 'Confirmed' }));

        toast({ title: "Thành công", description: `Booking ${bookingId} đã được xác nhận thanh toán .`, variant: "success" });
    };
    
    // --- Logic UI ---
    useEffect(() => {
        getAllBookings();
    }, [getAllBookings]);

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDialogOpen(true);
    };

    const filteredBookings = bookings.filter(b => 
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed':
                return <Badge variant="success">Đã xác nhận</Badge>;
            case 'Pending':
                return <Badge variant="warning">Chờ thanh toán</Badge>;
            case 'Cancelled':
                return <Badge variant="destructive">Đã hủy</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };
    
    // Custom Table Row component
    const BookingTableRow = ({ booking }) => {
        const isCancelled = booking.status === 'Cancelled';
        const isConfirmed = booking.status === 'Confirmed';
        
        return (
            <div 
                key={booking.id}
                className={`grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr] items-center p-4 border-b transition-colors text-sm
                    ${isCancelled ? 'bg-red-50 opacity-80' : 'hover:bg-indigo-50'}`}
            >
                <div className={`font-semibold ${isCancelled ? 'text-red-600' : 'text-indigo-700'}`}>{booking.id}</div>
                <div className="text-gray-700 truncate">{booking.customerName}</div>
                <div className="text-gray-600 font-medium">{booking.flightNumber}</div>
                <div className="font-bold text-green-700">
                    {booking.totalPrice?.toLocaleString('vi-VN')}₫
                </div>
                <div className="flex justify-center">{getStatusBadge(booking.status)}</div>
                
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
                    {booking.status === 'Pending' && (
                        <Button 
                            variant="success" 
                            size="sm"
                            title="Xác nhận thanh toán"
                            onClick={() => handleConfirmPayment(booking.id)}
                        >
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                    )}
                    
                    {booking.status !== 'Cancelled' && (
                        <Button 
                            variant="destructive" 
                            size="sm"
                            title="Hủy Booking"
                            onClick={() => handleCancelBooking(booking.id)}
                            className={booking.status === 'Confirmed' ? 'bg-red-500' : ''}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
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
                                    <TableHead className="w-[15%]">SỐ HIỆU BAY</TableHead>
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
                            <DialogTitle className="text-2xl">Chi tiết Booking: {selectedBooking?.id}</DialogTitle>
                            <DialogDescription>
                                Số hiệu bay: <span className="font-semibold text-indigo-600">{selectedBooking?.flightNumber}</span> | Ngày booking: {selectedBooking?.bookingDate}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t mt-4">
                                {/* Cột 1: Thông tin khách hàng */}
                                <DetailCard title="Thông tin Khách hàng">
                                    <DetailItem label="Tên" value={selectedBooking.customerName} />
                                    <DetailItem label="Email" value={selectedBooking.customerEmail} />
                                    <DetailItem label="Trạng thái" value={getStatusBadge(selectedBooking.status)} isBadge={true} />
                                </DetailCard>

                                {/* Cột 2: Thông tin thanh toán */}
                                <DetailCard title="Thông tin Thanh toán">
                                    <DetailItem 
                                        label="Tổng tiền" 
                                        value={<span className="text-xl font-bold text-green-600">{selectedBooking.totalPrice?.toLocaleString('vi-VN')}₫</span>} 
                                    />
                                    <DetailItem label="P/Thức" value={selectedBooking.paymentMethod} />
                                    <DetailItem 
                                        label="Tình trạng" 
                                        value={selectedBooking.status === 'Confirmed' ? 'Đã thanh toán' : selectedBooking.status === 'Pending' ? 'Chưa thanh toán' : 'Đã hủy'} 
                                    />
                                </DetailCard>

                                {/* Cột 3: Hành động */}
                                <DetailCard title="Hành động Quản lý">
                                    <div className="space-y-3">
                                        {selectedBooking.status === 'Pending' && (
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={() => handleConfirmPayment(selectedBooking.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận Thanh toán
                                            </Button>
                                        )}
                                        {selectedBooking.status !== 'Cancelled' && (
                                            <Button 
                                                className="w-full bg-red-600 hover:bg-red-700"
                                                onClick={() => handleCancelBooking(selectedBooking.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Hủy Booking
                                            </Button>
                                        )}
                                        {selectedBooking.status === 'Cancelled' && (
                                            <p className="text-red-500 font-medium p-2 bg-red-50 rounded-lg border border-red-200">
                                                <RotateCcw className="w-4 h-4 inline mr-2"/> Không thể thao tác trên Booking đã hủy.
                                            </p>
                                        )}
                                    </div>
                                </DetailCard>
                            </div>
                        )}
                        
                        {/* Bảng chi tiết vé */}
                        <div className="mt-6 border-t pt-4 max-h-[40vh] overflow-y-auto">
                            <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center space-x-2 border-b pb-2">
                                <Ticket className="w-5 h-5 text-indigo-600" />
                                <span>Danh sách Vé ({selectedBooking?.tickets?.length})</span>
                            </h3>
                            <Table>
                                <div className="min-w-[400px]">
                                    {/* Sub-Table Header */}
                                    <div className="grid grid-cols-4 p-3 font-semibold text-xs uppercase tracking-wider text-gray-700 bg-gray-50">
                                        <div className="truncate">MÃ VÉ</div>
                                        <div className="truncate">GHẾ</div>
                                        <div className="truncate">HẠNG</div>
                                        <div className="truncate text-right">GIÁ VÉ</div>
                                    </div>
                                </div>
                                <div className="min-w-[400px]">
                                    {selectedBooking?.tickets?.map(ticket => (
                                        <div key={ticket.id} className="grid grid-cols-4 p-3 border-b hover:bg-gray-100 transition-colors text-sm">
                                            <div className="font-mono text-gray-600">{ticket.id}</div>
                                            <div className="font-medium text-gray-800">{ticket.seat}</div>
                                            <div className="font-medium">{ticket.class}</div>
                                            <div className="text-green-600 font-semibold text-right">{ticket.price.toLocaleString('vi-VN')}₫</div>
                                        </div>
                                    ))}
                                </div>
                            </Table>
                        </div>
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



export default BookingManagementDashboard;