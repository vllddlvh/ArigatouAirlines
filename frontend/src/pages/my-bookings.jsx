'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getMyBookings } from '@/services/bookingService'
import { getTicketsByBookingId } from '@/services/ticketService'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plane, User, Calendar, CreditCard, CheckCircle2, 
  Clock, XCircle, ChevronRight, AlertCircle, Armchair 
} from 'lucide-react'

// --- HELPER FUNCTIONS ---

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

// Hàm lấy Badge trạng thái Booking
const getBookingStatusBadge = (status) => {
  // Map theo Enum StatusBooking backend
  switch (status) {
    case 'Confirmed':
      return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Đã xác nhận</Badge>
    case 'Pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>
    case 'Cancelled':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Đã hủy</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Hàm lấy Badge trạng thái Payment
const getPaymentStatusBadge = (status) => {
  // Map theo Enum StatusPayment backend
  switch (status) {
    case 'Paid':
      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Đã thanh toán</Badge>
    case 'Pending':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">Chưa thanh toán</Badge>
    case 'Refunded':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">Đã hoàn tiền</Badge>
    case 'Failed':
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Thất bại</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

// Hàm lấy Badge trạng thái Vé (Ticket)
const getTicketStatusBadge = (status) => {
  // Map theo Enum StatusTicket backend
  switch (status) {
    case 'Issued':
      return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Đã xuất vé</Badge>
    case 'CheckedIn':
      return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">Đã Check-in</Badge>
    case 'Boarded':
      return <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">Đã lên máy bay</Badge>
    case 'Cancelled':
      return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">Đã hủy</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  // State cho Modal chi tiết
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 1. Fetch danh sách Booking khi mount
  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    
    if (!token) {
      setIsLoading(false)
      // Redirect về login nếu cần
      return
    }

    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const response = await getMyBookings()
        // Giả sử API trả về list trực tiếp hoặc bọc trong field data
        const list = Array.isArray(response) ? response : (response?.data || [])
        // Sort booking mới nhất lên đầu
        setBookings(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } catch (e) {
        console.error("Fetch booking error:", e)
        setError('Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // 2. Xử lý mở chi tiết vé
  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
    setTickets([])
    setTicketsLoading(true)

    try {
      // Gọi API lấy vé theo bookingId
      const data = await getTicketsByBookingId(booking.bookingId)
      setTickets(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Fetch tickets error:", e)
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }

  // 3. Xử lý chuyển trang thanh toán
  const handlePaymentRedirect = (booking) => {
    router.push({
      pathname: '/payment',
      query: {
        bookingId: booking.bookingId,
        bookingCode: booking.bookingCode,
        totalAmount: booking.totalAmount,
        // Truyền Flight Info dưới dạng String để trang payment parse ra hiển thị
        flightInfo: JSON.stringify({
             route: booking.flight ? `${booking.flight.departureAirport?.city} - ${booking.flight.arrivalAirport?.city}` : 'Chuyến bay',
             date: booking.flight ? formatDate(booking.flight.departureTime) : '',
             flightNumber: booking.flight?.flightNumber,
             ticketClass: 'Phổ thông' // Hoặc lấy từ booking detail nếu có
        })
      }
    })
  }

  // --- RENDERING ---

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 max-w-6xl px-4">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-4">
             <Skeleton className="h-24 w-full rounded-xl" />
             <Skeleton className="h-24 w-full rounded-xl" />
             <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl px-4 min-h-screen bg-gray-50/50">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Plane className="h-8 w-8 text-orange-600" />
              Vé của tôi
           </h1>
           <p className="text-gray-500 mt-1">Quản lý lịch sử đặt chỗ và trạng thái vé</p>
        </div>
        <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 shadow-md">
           + Đặt chuyến bay mới
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
           <AlertCircle className="w-5 h-5" />
           {error}
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.bookingId} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-600">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Left: General Info */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Code</span>
                          <span className="font-mono text-lg font-bold text-orange-600">{booking.bookingCode}</span>
                       </div>
                       <div className="text-xs text-gray-400">
                          {formatDate(booking.createdAt)}
                       </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                       {getBookingStatusBadge(booking.statusBooking)}
                       {getPaymentStatusBadge(booking.statusPayment)}
                    </div>
                  </div>

                  {/* Right: Actions & Price */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end p-5 bg-gray-50/50 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 gap-3">
                     <div className="text-right">
                        <span className="text-xs text-gray-500 block">Tổng thanh toán</span>
                        <span className="text-xl font-bold text-blue-700">{formatCurrency(booking.totalAmount)}</span>
                     </div>
                     
                     <div className="flex gap-2 w-full md:w-auto">
                        {/* Nút Thanh toán chỉ hiện khi chưa thanh toán và chưa hủy */}
                        {booking.statusPayment === 'Pending' && booking.statusBooking !== 'Cancelled' && (
                             <Button 
                                size="sm" 
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => handlePaymentRedirect(booking)}
                             >
                                Thanh toán
                             </Button>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewDetails(booking)}
                        >
                            Chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        ) : (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Bạn chưa có chuyến đi nào</h3>
              <p className="text-gray-500 mb-6">Hãy đặt vé ngay để trải nghiệm những hành trình tuyệt vời.</p>
              <Button onClick={() => router.push('/')}>Tìm chuyến bay</Button>
           </div>
        )}
      </div>

      {/* --- DETAIL DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
               <Plane className="w-6 h-6 text-orange-600" />
               Chi tiết đặt chỗ
            </DialogTitle>
            <DialogDescription>
                Mã đặt chỗ: <span className="font-mono font-bold text-gray-900">{selectedBooking?.bookingCode}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
             <div className="space-y-6 mt-2">
                {/* 2. Passenger & Ticket List */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Danh sách vé & Hành khách
                    </h4>
                    
                    {ticketsLoading ? (
                        <div className="space-y-2">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="space-y-3">
                            {tickets.map((ticket, idx) => (
    <div key={ticket.ticketId || idx} className="border rounded-lg p-3 flex justify-between items-center bg-white shadow-sm">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                    {/* Dữ liệu đã được làm phẳng ở Mapper */}
                    {ticket.passengerName || 'Hành khách'}
                </span>
                <Badge variant="secondary" className="text-xs font-normal">
                    Người lớn
                </Badge>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                    <Armchair className="w-3 h-3" /> 
                    {/* Dữ liệu lấy trực tiếp từ field seatNumber */}
                    Ghế: <b className="text-gray-800">{ticket.seatNumber || 'N/A'}</b> 
                </span>
                <span>|</span>
                {/* Dữ liệu lấy trực tiếp từ field ticketId hoặc bookingCode */}
                <span>Mã vé: {ticket.ticketId}</span>
            </div>
        </div>
        
        {/* Phần Status: Nếu trong DTO TicketResponse không có status, bạn cần xem lại. 
            Nếu muốn hiển thị trạng thái chuyến bay thì dùng ticket.flight?.status */}
        <div>
            {/* {getTicketStatusBadge(ticket.status)} */} 
            {/* Tạm ẩn để tránh lỗi vì DTO TicketResponse chưa có field status */}
        </div>

        <div className="flex items-center gap-6">
                {ticket.flight ? (
                    <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold text-gray-800">
                            {/* DTO trả về String code trực tiếp */}
                            {ticket.flight.departureAirportCode || 'HAN'}
                        </div>
                        <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                        <div className="text-lg font-semibold text-gray-800">
                            {ticket.flight.arrivalAirportCode || 'SGN'}
                        </div>
                        <span className="text-sm text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded">
                            {ticket.flight.flightNumber}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-500 italic text-sm">Thông tin chuyến bay đang cập nhật</span>
                )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Thông tin chuyến bay
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-xs text-gray-500">Chuyến bay</p>
                    <p className="font-bold text-gray-900">{ticket.flight?.flightNumber}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Khởi hành</p>
                    <p className="font-bold text-gray-900">
                        {/* Vì DTO chỉ có Code, hiển thị Code thay cho City */}
                        {ticket.flight?.departureAirportCode}
                    </p>
                    {/* Sửa departureTime -> departureDateTime theo DTO */}
                    <p className="text-xs text-gray-600">{formatDate(ticket.flight?.departureDateTime)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Điểm đến</p>
                    <p className="font-bold text-gray-900">
                        {/* Vì DTO chỉ có Code, hiển thị Code thay cho City */}
                        {ticket.flight?.arrivalAirportCode}
                    </p>
                    {/* Sửa arrivalTime -> arrivalDateTime theo DTO */}
                    <p className="text-xs text-gray-600">{formatDate(ticket.flight?.arrivalDateTime)}</p>
                </div>
            </div>
        </div>
    </div>
))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm italic bg-gray-50 rounded">
                            Chưa có thông tin vé chi tiết.
                        </div>
                    )}
                </div>

                {/* 3. Payment Info Footer */}
                <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trạng thái thanh toán:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-700">{formatCurrency(selectedBooking.totalAmount)}</span>
                        {getPaymentStatusBadge(selectedBooking.statusPayment)}
                    </div>
                </div>

             </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}