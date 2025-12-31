'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getMyBookings } from '@/services/bookingService'
import { getTicketsByBookingId } from '@/services/ticketService'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Plane, User, Calendar, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const normalizeBookingStatus = (status) => {
  if (status === null || status === undefined) return 'Pending'

  // Prefer real enum names from backend
  if (typeof status === 'string') {
    if (['Pending', 'Confirmed', 'Cancelled'].includes(status)) return status
  }

  // Tolerate legacy values: 0/1/2, '0'/'1'/'2', ASCII 48/49/50
  const num = Number(status)
  if (Number.isNaN(num)) return 'Pending'
  if (num === 48) return 'Pending'
  if (num === 49) return 'Confirmed'
  if (num === 50) return 'Cancelled'
  if (num === 0) return 'Pending'
  if (num === 1) return 'Confirmed'
  if (num === 2) return 'Cancelled'
  return 'Pending'
}

const normalizePaymentStatus = (status) => {
  if (status === null || status === undefined) return 'Pending'

  // Prefer real enum names from backend
  if (typeof status === 'string') {
    if (['Pending', 'Paid', 'Refunded', 'Failed'].includes(status)) return status
  }

  // Tolerate legacy values: 0/1/2/3, '0'/'1'/'2'/'3', ASCII 48..51
  const num = Number(status)
  if (Number.isNaN(num)) return 'Pending'
  if (num === 48) return 'Pending'
  if (num === 49) return 'Paid'
  if (num === 50) return 'Refunded'
  if (num === 51) return 'Failed'
  if (num === 0) return 'Pending'
  if (num === 1) return 'Paid'
  if (num === 2) return 'Refunded'
  if (num === 3) return 'Failed'
  return 'Pending'
}

const normalizeTicketStatus = (status) => {
  if (status === null || status === undefined) return 'Issued'

  // Prefer real enum names from backend
  if (typeof status === 'string') {
    if (['Issued', 'CheckedIn', 'Boarded', 'Cancelled', 'Refunded'].includes(status)) return status
  }

  // Tolerate legacy values: 0..4, '0'..'4', ASCII 48..52
  const num = Number(status)
  if (Number.isNaN(num)) return 'Issued'
  if (num === 48) return 'Issued'
  if (num === 49) return 'CheckedIn'
  if (num === 50) return 'Boarded'
  if (num === 51) return 'Cancelled'
  if (num === 52) return 'Refunded'
  if (num === 0) return 'Issued'
  if (num === 1) return 'CheckedIn'
  if (num === 2) return 'Boarded'
  if (num === 3) return 'Cancelled'
  if (num === 4) return 'Refunded'
  return 'Issued'
}

const getStatusBadge = (status) => {
  const s = normalizeBookingStatus(status)
  switch (s) {
    case 'Confirmed':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Đã xác nhận</Badge>
    case 'Pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>
    case 'Cancelled':
      return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Đã hủy</Badge>
    default:
      return <Badge variant="outline">{s || 'N/A'}</Badge>
  }
}

const getPaymentBadge = (status) => {
  const s = normalizePaymentStatus(status)
  switch (s) {
    case 'Paid':
      return <Badge className="bg-green-500 hover:bg-green-600"><CreditCard className="w-3 h-3 mr-1" />Đã thanh toán</Badge>
    case 'Pending':
      return <Badge className="bg-orange-500 hover:bg-orange-600"><Clock className="w-3 h-3 mr-1" />Chưa thanh toán</Badge>
    case 'Refunded':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Đã hoàn tiền</Badge>
    case 'Failed':
      return <Badge className="bg-red-500 hover:bg-red-600">Thất bại</Badge>
    default:
      return <Badge variant="outline">{s || 'N/A'}</Badge>
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      setError('Vui lòng đăng nhập để xem danh sách vé đã đặt.')
      return
    }

    const run = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getMyBookings()
        setBookings(data || [])
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách vé đã đặt'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    run()
  }, [router])

  const openTickets = async (booking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
    setTickets([])
    setTicketsLoading(true)

    try {
      const bookingId = booking?.bookingId
      const data = await getTicketsByBookingId(bookingId)
      setTickets(data || [])
    } catch (e) {
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Vé đã đặt</h1>
        <Button variant="outline" onClick={() => router.push('/flights')}>Tìm chuyến bay</Button>
      </div>

      {error ? (
        <div className="p-4 border rounded-lg text-sm text-red-600">{error}</div>
      ) : null}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã booking</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái đặt vé</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.length ? bookings.map((b) => {
              const bookingStatus = normalizeBookingStatus(b.statusBooking)
              const paymentStatus = normalizePaymentStatus(b.statusPayment)

              return (
              <TableRow key={b.bookingId || b.bookingCode}>
                <TableCell className="font-medium font-mono text-orange-600">{b.bookingCode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : ''}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-600">{formatCurrency(b.totalAmount)}</TableCell>
                <TableCell>{getStatusBadge(bookingStatus)}</TableCell>
                <TableCell>{getPaymentBadge(paymentStatus)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {paymentStatus === 'Pending' && bookingStatus !== 'Cancelled' && (
                    <Button 
                      variant="orange" 
                      size="sm"
                      onClick={() => router.push({
                        pathname: '/payment',
                        query: {
                          bookingId: b.bookingId,
                          bookingCode: b.bookingCode,
                          totalAmount: b.totalAmount
                        }
                      })}
                    >
                      Thanh toán
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openTickets(b)}>Xem vé</Button>
                </TableCell>
              </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Plane className="w-12 h-12 text-gray-300" />
                    <p>Bạn chưa có booking nào</p>
                    <Button variant="outline" onClick={() => router.push('/flights')}>Tìm chuyến bay ngay</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-orange-500" />
              Chi tiết vé
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Info */}
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mã booking:</span>
                <span className="font-mono font-bold text-orange-600">{selectedBooking?.bookingCode}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                {getStatusBadge(normalizeBookingStatus(selectedBooking?.statusBooking))}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Thanh toán:</span>
                {getPaymentBadge(normalizePaymentStatus(selectedBooking?.statusPayment))}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-green-600">{formatCurrency(selectedBooking?.totalAmount)}</span>
              </div>
            </div>

            {/* Tickets List */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Danh sách vé ({tickets?.length || 0})</h4>
              
              {ticketsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {tickets?.length ? tickets.map((t, idx) => (
                    <div key={t.ticketNumber || idx} className="p-3 border rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-500">Số vé</div>
                          <div className="font-mono text-sm font-medium text-blue-600">{t.ticketNumber || 'N/A'}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {normalizeTicketStatus(t.status) || 'Issued'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{t?.passenger?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Plane className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">
                            {t?.flight?.schedule?.flightNumber || t?.flight?.flightNumber || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {(t?.flightSeat?.seat?.seatNumber || t?.flightSeat?.seatNumber) && (
                        <div className="mt-2 text-xs">
                          <span className="text-gray-500">Ghế: </span>
                          <span className="font-semibold">{t?.flightSeat?.seat?.seatNumber || t?.flightSeat?.seatNumber}</span>
                          {t?.flightSeat?.seatClass && (
                            <span className="ml-2 text-gray-500">({t.flightSeat.seatClass})</span>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Không có vé cho booking này
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
