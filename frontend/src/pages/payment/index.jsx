'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, CreditCard, Wallet, Banknote, ArrowLeft, CheckCircle2, 
  QrCode, ClipboardCopy, ChevronDown, ChevronUp, Plane, Clock, Users 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { confirmPayment } from "@/services/paymentService";
import { validateVoucher } from "@/services/voucherService";

// --- PAYMENT METHOD DATA ---
const paymentOptions = [
  { id: 'card', label: 'Thẻ Tín dụng / Ghi nợ', icon: CreditCard, description: 'Thanh toán quốc tế bảo mật.' },
  { id: 'e-wallet', label: 'Ví điện tử (Momo/ZaloPay)', icon: Wallet, description: 'Quét mã QR, thanh toán nhanh chóng.' },
  { id: 'bank', label: 'Chuyển khoản Ngân hàng', icon: Banknote, description: 'Phổ biến: Vietcombank, MB, Techcombank.' },
];

// --- HELPER FUNCTIONS ---
const copyToClipboard = (text) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (error) {
    console.error("Could not copy text: ", error);
    return false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- MAIN COMPONENT ---
export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [bookingData, setBookingData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes countdown

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscountAmount, setVoucherDiscountAmount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Get booking data from query or localStorage
  useEffect(() => {
    const { bookingId, bookingCode, totalAmount, baseTotalAmount, voucherCode: voucherFromQuery, flightInfo } = router.query;
    
    if (bookingId) {
      const parsedTotal = parseFloat(totalAmount) || 0;
      const parsedBaseTotal = baseTotalAmount != null ? (parseFloat(baseTotalAmount) || 0) : parsedTotal;
      const initialVoucherCode = voucherFromQuery ? String(voucherFromQuery) : '';
      const inferredDiscount = parsedBaseTotal > parsedTotal ? (parsedBaseTotal - parsedTotal) : 0;

      const data = {
        bookingId: parseInt(bookingId),
        bookingCode,
        totalAmount: parsedTotal,
        baseTotalAmount: parsedBaseTotal,
        flightInfo: flightInfo ? JSON.parse(flightInfo) : null
      };
      setBookingData(data);
      localStorage.setItem('pendingPayment', JSON.stringify(data));

      setVoucherCode(initialVoucherCode);
      setVoucherDiscountAmount(inferredDiscount);
    } else {
      // Try to get from localStorage
      const saved = localStorage.getItem('pendingPayment');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBookingData(parsed);
        setVoucherCode('');
        const base = Number(parsed?.baseTotalAmount ?? 0);
        const total = Number(parsed?.totalAmount ?? 0);
        setVoucherDiscountAmount(base > total ? (base - total) : 0);
      }
    }
  }, [router.query]);

  const handleApplyVoucher = async () => {
    if (!bookingData) return;
    const code = String(voucherCode || '').trim();
    if (!code) {
      setVoucherDiscountAmount(0);
      const resetTotal = Number(bookingData.baseTotalAmount ?? bookingData.totalAmount ?? 0);
      setBookingData((prev) => prev ? ({ ...prev, totalAmount: resetTotal }) : prev);
      localStorage.setItem('pendingPayment', JSON.stringify({
        ...bookingData,
        totalAmount: resetTotal,
      }));
      return;
    }

    const baseAmount = Number(bookingData.baseTotalAmount ?? bookingData.totalAmount ?? 0);
    setIsApplyingVoucher(true);
    try {
      const res = await validateVoucher({ voucherCode: code, orderAmount: baseAmount });
      const discount = Number(res?.discountAmount ?? 0);
      const finalAmt = Number(res?.finalAmount ?? (baseAmount - discount));

      setVoucherDiscountAmount(discount);
      setBookingData((prev) => prev ? ({ ...prev, totalAmount: finalAmt }) : prev);
      localStorage.setItem('pendingPayment', JSON.stringify({
        ...bookingData,
        totalAmount: finalAmt,
      }));

      toast({
        title: "Áp dụng voucher thành công",
        description: `Giảm ${discount.toLocaleString()} VND`,
      });
    } catch (error) {
      setVoucherDiscountAmount(0);
      setBookingData((prev) => prev ? ({ ...prev, totalAmount: baseAmount }) : prev);
      localStorage.setItem('pendingPayment', JSON.stringify({
        ...bookingData,
        totalAmount: baseAmount,
      }));
      toast({
        title: "Voucher không hợp lệ",
        description: error?.response?.data?.message || error?.message || "Voucher không hợp lệ",
        variant: "destructive",
      });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || paymentSuccess) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, paymentSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    
    if (!bookingData?.bookingId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin đặt vé.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call API to confirm payment
      const code = String(voucherCode || '').trim();
      const updated = await confirmPayment(bookingData.bookingId, code || null);

      if (updated?.totalAmount != null) {
        const newTotal = Number(updated.totalAmount);
        const base = Number(bookingData.baseTotalAmount ?? 0);
        setBookingData((prev) => prev ? ({ ...prev, totalAmount: newTotal }) : prev);
        setVoucherDiscountAmount(base > 0 && base > newTotal ? (base - newTotal) : 0);
      }
      
      setPaymentSuccess(true);
      localStorage.removeItem('pendingPayment');
      
      toast({
        title: "Thanh toán thành công!",
        description: "Vé của bạn đã được xác nhận.",
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Thanh toán thất bại",
        description: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleViewBookings = () => {
    router.push('/my-bookings');
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-orange-500 mb-4" />
              <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="text-gray-600">Mã đặt vé: <span className="font-mono font-bold text-orange-600">{bookingData.bookingCode}</span></p>
          </div>
          
          {/* Countdown Timer */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            countdown < 300 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{formatTime(countdown)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-orange-500" />
                Thông tin đặt vé
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingData.flightInfo ? (
                <div className="space-y-2">
                  <p><span className="text-gray-500">Chuyến bay:</span> <strong>{bookingData.flightInfo.flightNumber}</strong></p>
                  <p><span className="text-gray-500">Hành trình:</span> {bookingData.flightInfo.route}</p>
                  <p><span className="text-gray-500">Ngày bay:</span> {bookingData.flightInfo.date}</p>
                  <p><span className="text-gray-500">Hạng vé:</span> {bookingData.flightInfo.ticketClass}</p>
                </div>
              ) : (
                <p className="text-gray-500">Thông tin chuyến bay đã được lưu trong hệ thống.</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn phương thức thanh toán</CardTitle>
              <CardDescription>Chọn phương thức phù hợp với bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSelectedMethod(option.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all",
                    selectedMethod === option.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-full",
                    selectedMethod === option.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2",
                    selectedMethod === option.id
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {selectedMethod === option.id && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Form based on selected method */}
          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMethod === 'card' && 'Thông tin thẻ'}
                  {selectedMethod === 'e-wallet' && 'Thanh toán qua Ví điện tử'}
                  {selectedMethod === 'bank' && 'Chuyển khoản Ngân hàng'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMethod === 'card' && (
                  <CardPaymentForm 
                    loading={loading} 
                    handleSubmit={handlePayment} 
                    amount={bookingData.totalAmount}
                  />
                )}
                {selectedMethod === 'e-wallet' && (
                  <EWalletPaymentDisplay 
                    loading={loading} 
                    handleSubmit={handlePayment} 
                    amount={bookingData.totalAmount}
                    bookingCode={bookingData.bookingCode}
                  />
                )}
                {selectedMethod === 'bank' && (
                  <BankPaymentDisplay 
                    loading={loading} 
                    handleSubmit={handlePayment} 
                    amount={bookingData.totalAmount}
                    bookingCode={bookingData.bookingCode}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Mã giảm giá</div>
                <div className="flex gap-2">
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher"
                    disabled={loading || isApplyingVoucher}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyVoucher}
                    disabled={loading || isApplyingVoucher}
                  >
                    {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(bookingData.baseTotalAmount ?? bookingData.totalAmount)}</span>
              </div>

              {voucherDiscountAmount > 0 ? (
                <div className="flex justify-between text-gray-600">
                  <span>Giảm giá</span>
                  <span className="text-green-600">- {formatCurrency(voucherDiscountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-gray-600">
                <span>Phí dịch vụ</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{formatCurrency(bookingData.totalAmount)}</span>
              </div>
              
              {!selectedMethod && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Vui lòng chọn phương thức thanh toán
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-center">Thanh toán thành công!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 text-center">
            <DialogDescription className="text-lg">
              Mã đặt vé của bạn là:
            </DialogDescription>
            <div className="px-6 py-3 text-xl font-mono font-bold bg-green-100 text-green-700 rounded-lg">
              {bookingData.bookingCode}
            </div>
            <DialogDescription className="text-base">
              Vé điện tử đã được gửi đến email của bạn.<br />
              Cảm ơn quý khách đã sử dụng dịch vụ!
            </DialogDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleViewBookings}
              variant="outline"
              className="flex-1"
            >
              Xem vé của tôi
            </Button>
            <Button
              onClick={handleReturnHome}
              variant="orange"
              className="flex-1 text-white"
            >
              Về trang chủ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CardPaymentForm({ loading, handleSubmit, amount }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 border-l-4 border-orange-400 pl-3 py-1 bg-orange-50 rounded-r-md">
        Thanh toán được bảo mật bởi SSL 256-bit.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số thẻ tín dụng
          </label>
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            required
            className="p-3 border-gray-300"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hết hạn
            </label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
              required
              className="p-3 border-gray-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <Input
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              required
              className="p-3 border-gray-300"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          variant="orange"
          className="mt-4 w-full text-lg shadow-lg text-white"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
          ) : (
            `Thanh toán ${formatCurrency(amount)}`
          )}
        </Button>
      </form>
    </div>
  );
}

function EWalletPaymentDisplay({ loading, handleSubmit, amount, bookingCode }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (copyToClipboard(bookingCode)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="text-center space-y-6">
      <p className="text-sm text-gray-600 border-l-4 border-purple-500 pl-3 py-1 bg-purple-50 rounded-r-md text-left">
        Quét mã QR dưới đây bằng ứng dụng <strong>Momo</strong> hoặc <strong>ZaloPay</strong> để thanh toán.
      </p>
      
      {/* Mock QR Code */}
      <div className="flex justify-center my-6">
        <div className="p-4 border-8 border-purple-500 bg-white shadow-xl rounded-xl">
          <QrCode className="w-32 h-32 md:w-48 md:h-48 text-gray-800" />
        </div>
      </div>
      
      <p className="text-lg font-bold text-gray-700">
        Tổng tiền: <span className="text-purple-600">{formatCurrency(amount)}</span>
      </p>
      
      <p className="text-sm text-gray-500">
        Nội dung: <span className="font-mono font-bold">{bookingCode}</span>
      </p>

      <Button 
        onClick={handleSubmit} 
        disabled={loading} 
        className="w-full text-lg shadow-lg bg-purple-600 hover:bg-purple-700 text-white"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang chờ xác nhận...</>
        ) : (
          "Tôi đã thanh toán"
        )}
      </Button>
      
      <Button variant="outline" onClick={handleCopy} size="sm" className="mt-2 w-full">
        <ClipboardCopy className="w-4 h-4 mr-2" /> 
        {copied ? "Đã sao chép mã!" : "Sao chép mã đặt vé"}
      </Button>
    </div>
  );
}

function BankPaymentDisplay({ loading, handleSubmit, amount, bookingCode }) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const bankInfo = {
    accountName: "CONG TY CP HANG KHONG ARIGATOU",
    accountNumber: "9876543210123",
    bankName: "VIETCOMBANK (VCB)",
    content: `ARIGATOU ${bookingCode}`
  };
  
  const handleCopy = (text, setter) => {
    if (copyToClipboard(text)) {
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 rounded-r-md">
        Vui lòng chuyển khoản chính xác <strong>Số tiền</strong> và <strong>Nội dung</strong> dưới đây.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem 
          label="Ngân hàng" 
          value={bankInfo.bankName} 
          color="text-green-700"
        />
        <InfoItem 
          label="Tên tài khoản" 
          value={bankInfo.accountName} 
          color="text-gray-900"
        />
        <InfoItem 
          label="Số tài khoản" 
          value={bankInfo.accountNumber} 
          color="text-blue-600"
          copyText={bankInfo.accountNumber}
          copied={copiedAccount}
          onCopy={() => handleCopy(bankInfo.accountNumber, setCopiedAccount)}
        />
        <InfoItem 
          label="Số tiền cần chuyển" 
          value={formatCurrency(amount)} 
          color="text-red-600 font-bold"
          copyText={amount.toString()}
          copied={copiedAmount}
          onCopy={() => handleCopy(amount.toString(), setCopiedAmount)}
        />
      </div>

      <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-yellow-50">
        <h4 className="font-semibold text-gray-800 mb-2">Nội dung chuyển khoản (BẮT BUỘC):</h4>
        <p className="font-mono text-sm text-red-700 bg-white p-2 rounded break-all">
          {bankInfo.content}
        </p>
      </div>

      <Button 
        onClick={() => setShowInstructions(!showInstructions)} 
        variant="outline" 
        className="w-full mt-4 text-gray-700"
      >
        Hướng dẫn chi tiết {showInstructions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </Button>

      {showInstructions && (
        <div className="p-4 bg-gray-100 rounded-lg mt-2 text-left text-sm space-y-2">
          <p>1. <strong>Thực hiện chuyển khoản</strong> qua Mobile Banking hoặc ATM.</p>
          <p>2. <strong>Điền chính xác</strong> số tiền và nội dung chuyển khoản như trên.</p>
          <p>3. Nhấn <strong>&quot;Tôi đã thanh toán&quot;</strong> để hệ thống xác nhận.</p>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={loading} 
        variant="orange" 
        className="w-full text-lg shadow-lg text-white"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xác nhận...</>
        ) : (
          "Tôi đã thanh toán"
        )}
      </Button>
    </div>
  );
}

function InfoItem({ label, value, color, onCopy, copied, copyText }) {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <div className="flex items-center justify-between mt-1">
        <p className={cn("text-base font-semibold", color)}>
          {value}
        </p>
        {onCopy && (
          <button 
            type="button" 
            onClick={onCopy} 
            className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
            title="Sao chép"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ClipboardCopy className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
