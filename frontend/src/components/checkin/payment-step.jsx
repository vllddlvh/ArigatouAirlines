'use client';

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Wallet, Banknote, ArrowLeft, CheckCircle2, QrCode, ClipboardCopy, ChevronDown, ChevronUp, Mail, Phone, User } from 'lucide-react';

// --- CONFIG ---
const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Thẻ Tín dụng / Ghi nợ', icon: CreditCard, description: 'Visa, Mastercard, JCB.' },
  { id: 'e-wallet', label: 'Ví điện tử', icon: Wallet, description: 'Momo, ZaloPay, ShopeePay.' },
  { id: 'bank', label: 'Chuyển khoản Ngân hàng', icon: Banknote, description: 'VietQR, Napas 24/7.' },
];

const formatCurrency = (value) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// --- HELPER ---
const copyToClipboard = (text) => {
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

// --- SUB-COMPONENTS ---

function CardPaymentForm({ isLoading, onSubmit, amount }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r text-sm text-orange-800">
        <p>Thanh toán bảo mật. Vé điện tử sẽ được gửi ngay sau khi giao dịch thành công.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số thẻ tín dụng</label>
          <Input placeholder="0000 0000 0000 0000" className="font-mono" required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hết hạn</label>
            <Input placeholder="MM/YY" className="font-mono" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <Input placeholder="123" type="password" className="font-mono" maxLength={3} required />
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
            <Input placeholder="NGUYEN VAN A" className="uppercase" required />
        </div>
        
        <Button type="submit" disabled={isLoading} variant="orange" className="w-full text-lg h-12 shadow-lg bg-orange-600 hover:bg-orange-700 text-white">
          {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</> : `Thanh toán ${formatCurrency(amount)}`}
        </Button>
      </form>
    </div>
  );
}

function EWalletPayment({ isLoading, onSubmit, amount }) {
  return (
    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 bg-white border-4 border-purple-500 rounded-xl inline-block shadow-lg">
        <QrCode className="w-40 h-40 text-gray-800 mx-auto" />
        <p className="mt-2 text-xs text-gray-500 font-mono">SCAN TO PAY</p>
      </div>
      
      <div>
        <p className="text-gray-600 mb-2">Tổng thanh toán:</p>
        <p className="text-2xl font-bold text-purple-700">{formatCurrency(amount)}</p>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md">
          {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xác nhận...</> : "Đã Quét Mã & Thanh Toán"}
      </Button>
    </div>
  );
}

function BankTransferPayment({ isLoading, onSubmit, amount, bookingRef }) {
  const [copied, setCopied] = useState(false);
  const transferContent = `QAIR ${bookingRef || 'BOOKING'}`;

  const handleCopy = () => {
    copyToClipboard(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
        <div className="flex justify-between border-b border-blue-200 pb-2">
            <span className="text-gray-600">Ngân hàng:</span>
            <span className="font-bold text-blue-800">Vietcombank (VCB)</span>
        </div>
        <div className="flex justify-between border-b border-blue-200 pb-2">
            <span className="text-gray-600">Số tài khoản:</span>
            <span className="font-bold text-blue-800 font-mono text-lg">9999 8888 66</span>
        </div>
        <div className="flex justify-between border-b border-blue-200 pb-2">
            <span className="text-gray-600">Chủ tài khoản:</span>
            <span className="font-bold text-blue-800 uppercase">Cong Ty QAirline</span>
        </div>
        <div className="flex justify-between items-center pt-1">
            <span className="text-gray-600">Nội dung CK:</span>
            <div className="flex items-center gap-2">
                <span className="font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200 font-mono">
                    {transferContent}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <ClipboardCopy className="h-4 w-4 text-gray-500" />}
                </Button>
            </div>
        </div>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang kiểm tra...</> : "Tôi Đã Chuyển Khoản"}
      </Button>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function PaymentStep({
  amount = 0,
  currency = "VND",
  bookingId = "PENDING...", // Nhận từ CheckInPage (hoặc PENDING nếu chưa tạo)
  contactInfo,              // Nhận từ CheckInPage
  onPaymentSuccess,         // Hàm trigger tạo booking/confirm
  isLoading,                // State loading từ Hook (isCreatingBooking)
  onBack
}) {
  const [method, setMethod] = useState('card');
  const [localProcessing, setLocalProcessing] = useState(false); // Loading giả lập payment gateway

  // Tổng hợp trạng thái loading: Local (Check thẻ) HOẶC Parent (Gọi API Booking)
  const isBusy = localProcessing || isLoading;

  const handleProcessPayment = async (e) => {
    if (e) e.preventDefault();
    
    // 1. Giả lập xử lý thanh toán (verify thẻ, check số dư...)
    setLocalProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Delay 1.5s cho UX
    setLocalProcessing(false);

    // 2. Gọi callback của Parent để thực hiện logic nghiệp vụ (Tạo Booking -> API)
    if (onPaymentSuccess) {
        onPaymentSuccess();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-l-4 border-orange-500 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Tổng thanh toán</h2>
                    <span className="text-2xl font-bold text-orange-600">{formatCurrency(amount)}</span>
                </div>
                <div className="text-sm text-gray-500 flex gap-4">
                    <span className="flex items-center gap-1"><User className="h-3 w-3"/> {contactInfo?.email || 'Khách hàng'}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {contactInfo?.phone || '---'}</span>
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-gray-50 border-gray-200 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center h-full">
                <span className="text-xs text-gray-500 uppercase font-semibold">Mã đặt chỗ (Tạm tính)</span>
                <span className="text-xl font-mono font-bold text-gray-700">{bookingId}</span>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Payment Methods */}
        <div className="lg:col-span-4 space-y-3">
            <h3 className="font-semibold text-gray-700 mb-2">Phương thức thanh toán</h3>
            {PAYMENT_OPTIONS.map((opt) => (
                <div
                    key={opt.id}
                    onClick={() => !isBusy && setMethod(opt.id)}
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        method === opt.id 
                            ? "border-orange-500 bg-orange-50 shadow-md" 
                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50",
                        isBusy && "opacity-50 pointer-events-none"
                    )}
                >
                    <div className={cn("p-2 rounded-full", method === opt.id ? "bg-orange-200 text-orange-700" : "bg-gray-100 text-gray-500")}>
                        <opt.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <div className={cn("font-bold", method === opt.id ? "text-orange-900" : "text-gray-700")}>{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                    </div>
                </div>
            ))}
            
            <Button variant="ghost" onClick={onBack} disabled={isBusy} className="w-full mt-4 text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại chọn ghế
            </Button>
        </div>

        {/* Right: Payment Details Form */}
        <div className="lg:col-span-8">
            <Card className="h-full border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="border-b bg-gray-50/50 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {method === 'card' && <CreditCard className="text-blue-600"/>}
                        {method === 'e-wallet' && <Wallet className="text-purple-600"/>}
                        {method === 'bank' && <Banknote className="text-green-600"/>}
                        {PAYMENT_OPTIONS.find(o => o.id === method)?.label}
                    </CardTitle>
                    <CardDescription>
                        {method === 'card' ? "Nhập thông tin thẻ để hoàn tất." : "Thực hiện giao dịch theo hướng dẫn."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {method === 'card' && <CardPaymentForm isLoading={isBusy} onSubmit={handleProcessPayment} amount={amount} />}
                    {method === 'e-wallet' && <EWalletPayment isLoading={isBusy} onSubmit={handleProcessPayment} amount={amount} />}
                    {method === 'bank' && <BankTransferPayment isLoading={isBusy} onSubmit={handleProcessPayment} amount={amount} bookingRef={bookingId} />}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}