'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Clock, Plane, CheckCircle2 
} from 'lucide-react';
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { validateVoucher } from "@/services/voucherService";

import BookingSummary from "@/components/payment/BookingSummary";
import PaymentMethods from "@/components/payment/PaymentMethods";
import MethodVnPay from "@/components/payment/MethodVnPay";
import MethodBankTransfer from "@/components/payment/MethodBankTransfer";
import AncillaryServiceSelector from "@/components/payment/AncillaryServiceSelector"; 

// Helper
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // --- STATE MANAGEMENT ---
  const [bookingData, setBookingData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [countdown, setCountdown] = useState(15 * 60);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscountAmount, setVoucherDiscountAmount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Service State (MỚI)
  const [selectedServices, setSelectedServices] = useState([]);

  // --- 1. INITIALIZE DATA ---
  useEffect(() => {
    const { bookingId, bookingCode, totalAmount, baseTotalAmount, voucherCode: queryVoucher, flightInfo } = router.query;
    
    if (bookingId) {
      const parsedTotal = parseFloat(totalAmount) || 0;
      const parsedBase = baseTotalAmount != null ? parseFloat(baseTotalAmount) : parsedTotal;
      // Nếu load lại trang mà total < base, coi như đã có giảm giá trước đó (logic cũ)
      const inferredDiscount = parsedBase > parsedTotal ? (parsedBase - parsedTotal) : 0;

      const data = {
        bookingId: parseInt(bookingId),
        bookingCode: String(bookingCode),
        totalAmount: parsedTotal, 
        baseTotalAmount: parsedBase,
        flightInfo: flightInfo ? JSON.parse(flightInfo) : null
      };

      setBookingData(data);
      setVoucherCode(queryVoucher ? String(queryVoucher) : '');
      setVoucherDiscountAmount(inferredDiscount);

      localStorage.setItem('pendingPayment', JSON.stringify(data));
    } else {
      const saved = localStorage.getItem('pendingPayment');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBookingData(parsed);
        const base = Number(parsed.baseTotalAmount ?? 0);
        const total = Number(parsed.totalAmount ?? 0);
        setVoucherDiscountAmount(base > total ? (base - total) : 0);
      }
    }
  }, [router.query]);

  // --- 2. LOGIC TÍNH TOÁN TỔNG TIỀN (QUAN TRỌNG) ---
  // Tính tổng tiền dịch vụ
  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
  }, [selectedServices]);

  // Tính tổng tiền cuối cùng = (Giá vé gốc + Dịch vụ) - Voucher
  const finalTotalAmount = useMemo(() => {
    if (!bookingData) return 0;
    const base = bookingData.baseTotalAmount || 0;
    const subTotal = base + servicesTotal;
    const final = subTotal - voucherDiscountAmount;
    return final > 0 ? final : 0; // Không để âm
  }, [bookingData, servicesTotal, voucherDiscountAmount]);

  // --- 3. COUNTDOWN TIMER ---
  useEffect(() => {
    if (paymentSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentSuccess]);

  // --- 4. HANDLERS ---
  
  // Toggle Dịch vụ (Thêm/Bớt)
  const handleToggleService = (service) => {
    setSelectedServices(prev => {
        const exists = prev.find(s => s.serviceName === service.serviceName);
        if (exists) {
            return prev.filter(s => s.serviceName !== service.serviceName);
        } else {
            return [...prev, service];
        }
    });
  };

  const handleApplyVoucher = async () => {
    if (!bookingData) return;
    
    const code = voucherCode.trim();
    // Tổng tiền để check voucher phải bao gồm cả dịch vụ
    const currentOrderAmount = (bookingData.baseTotalAmount || 0) + servicesTotal;

    if (!code) {
      setVoucherDiscountAmount(0);
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const res = await validateVoucher({ voucherCode: code, orderAmount: currentOrderAmount });
      
      const discount = Number(res?.discountAmount ?? 0);
      setVoucherDiscountAmount(discount);

      toast({
        title: "Áp dụng thành công",
        description: `Bạn được giảm ${discount.toLocaleString()} VND`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error) {
      setVoucherDiscountAmount(0);
      toast({
        title: "Không thể áp dụng",
        description: error?.response?.data?.message || "Mã voucher không hợp lệ.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  // --- 5. SUCCESS HANDLERS ---
  const handleManualPaymentSuccess = () => {

    setPaymentSuccess(true);
    localStorage.removeItem('pendingPayment');
  };

  const handleReturnHome = () => router.push('/');
  const handleViewBookings = () => router.push('/my-bookings');

  // --- 6. RENDER ---
  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-b-orange-200"></div>
          <p className="text-gray-500 font-medium">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 sm:p-6 pb-20">
      
      {/* HEADER AREA */}
      <div className="max-w-5xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 hover:bg-orange-100 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="text-gray-600 mt-1">
              Mã đặt chỗ: <span className="font-mono font-bold text-orange-600 text-lg">{bookingData.bookingCode}</span>
            </p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${countdown < 300 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-100 border-orange-200 text-orange-800'}`}>
            <Clock className="w-5 h-5" />
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase font-semibold opacity-70">Thời gian giữ vé</span>
              <span className="font-mono font-bold text-xl leading-none">{formatTime(countdown)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Flight Info + Services + Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Flight Info Summary */}
          <Card className="shadow-sm border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gray-800">
                <Plane className="w-5 h-5 text-orange-500" />
                Thông tin chuyến bay
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingData.flightInfo ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-md">
                   <div>
                      <p className="font-bold text-lg text-gray-900">{bookingData.flightInfo.route}</p>
                      <p className="text-sm text-gray-500">{bookingData.flightInfo.date}</p>
                   </div>
                   <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
                        {bookingData.flightInfo.flightNumber}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{bookingData.flightInfo.ticketClass}</p>
                   </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Chi tiết chuyến bay đã được lưu trong hệ thống.</p>
              )}
            </CardContent>
          </Card>
          {/* 2. ANCILLARY SERVICES  */}
          <AncillaryServiceSelector 
             selectedServices={selectedServices}
             onToggleService={handleToggleService}
          />

          {/* 3. Method Selector */}
          <PaymentMethods 
            selectedMethod={selectedMethod} 
            onSelect={setSelectedMethod} 
          />

          {/* 4. Active Method Content */}
          <Card className="border-t-4 border-t-orange-500 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="pt-6">
              {selectedMethod === 'vnpay' && (
                <MethodVnPay 
                  amount={finalTotalAmount} 
                  voucherCode={voucherCode}
                  bookingId={bookingData.bookingId}
                />
              )}
              {selectedMethod === 'bank_transfer' && (
                <MethodBankTransfer 
                  amount={finalTotalAmount} 
                  bookingCode={bookingData.bookingCode} 
                  bookingId={bookingData.bookingId}
                  voucherCode={voucherCode}
                  serviceIds={selectedServices.map(service => service.serviceId)}
                  onSuccess={handleManualPaymentSuccess}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Bill Summary */}
        <div className="lg:col-span-1">
          <BookingSummary 
            bookingData={{
                ...bookingData,
                totalAmount: finalTotalAmount
            }}
            voucherCode={voucherCode}
            setVoucherCode={setVoucherCode}
            handleApplyVoucher={handleApplyVoucher}
            isApplyingVoucher={isApplyingVoucher}
            voucherDiscountAmount={voucherDiscountAmount}
            // Truyền thêm danh sách dịch vụ để hiển thị bên summary (nếu component hỗ trợ custom render)
            extraServices={selectedServices} 
            servicesTotal={servicesTotal}
          />
          
          {/* Nếu BookingSummary chưa hiển thị list dịch vụ, ta render thủ công bên dưới nó */}
          {selectedServices.length > 0 && (
            <div className="mt-4 bg-orange-50/60 rounded-xl p-4 border border-orange-100">
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex justify-between items-center">
                <span>Dịch vụ đã chọn</span>
                <span className="text-xs font-normal bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                  {selectedServices.length} món
                </span>
              </h4>
              
              <ul className="space-y-3">
                {selectedServices.map((s, index) => (
                  <li key={s.id || index} className="relative pl-4 border-l-2 border-orange-300">
                    <div className="flex justify-between items-start">
                      <div className="pr-2">
                        <span className="text-sm font-medium text-gray-800 block">
                          {s.serviceName}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5 italic">
                          {s.description}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {s.price.toLocaleString()}đ
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Tổng phụ tiền dịch vụ */}
              <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between items-center">
                <span className="text-xs text-gray-600">Tổng dịch vụ</span>
                <span className="text-sm font-bold text-orange-700">
                  {selectedServices.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}đ
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle2 className="w-20 h-20 text-green-500 shadow-green-200 drop-shadow-xl" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Thanh toán thành công!
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 text-center py-2">
            <DialogDescription className="text-base text-gray-600">
              Cảm ơn bạn đã hoàn tất thanh toán. <br/>
              Mã đặt chỗ của bạn là:
            </DialogDescription>
            
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-3xl font-mono font-bold text-green-700 tracking-wider">
                {bookingData.bookingCode}
              </p>
            </div>
            
            <p className="text-sm text-gray-500 px-4">
              Vé điện tử và hóa đơn đã được gửi vào địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={handleViewBookings}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Xem vé của tôi
            </Button>
            <Button
              onClick={handleReturnHome}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-md"
            >
              Về trang chủ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}