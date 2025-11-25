'use client';

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Wallet, Banknote, ArrowLeft, CheckCircle2, QrCode, ClipboardCopy, ChevronDown, ChevronUp } from 'lucide-react';

// --- PAYMENT METHOD DATA ---
const paymentOptions = [
  { id: 'card', label: 'Thẻ Tín dụng / Ghi nợ', icon: CreditCard, description: 'Thanh toán quốc tế bảo mật.' },
  { id: 'e-wallet', label: 'Ví điện tử (Momo/ZaloPay)', icon: Wallet, description: 'Quét mã QR, thanh toán nhanh chóng.' },
  { id: 'bank', label: 'Chuyển khoản Ngân hàng', icon: Banknote, description: 'Phổ biến: Vietcombank, MB, Techcombank.' },
];

// --- MOCK API FUNCTIONS ---

// Mock function to copy text to clipboard (using deprecated execCommand for iFrame compatibility)
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

// --- SUB-COMPONENTS ---

function CardPaymentForm({ loading, handleSubmit, amount, currency }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 border-l-4 border-orange-400 pl-3 py-1 bg-orange-50 rounded-r-md">
        Thanh toán được bảo mật bởi Stripe Mockup.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số thẻ tín dụng
          </label>
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
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
              required
              className="p-3 border-gray-300"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          variant="orange"
          className="mt-4 w-full text-lg shadow-lg"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
          ) : (
            `Thanh toán ${amount} ${currency?.toUpperCase()}`
          )}
        </Button>
      </form>
    </div>
  );
}

function EWalletPaymentDisplay({ loading, handleSubmit, amount, currency }) {
  const [copied, setCopied] = useState(false);
  const mockQrCodeText = `PAY|QAIRLINE|${amount}|${currency}|BOOKING12345`;
  
  const handleCopy = () => {
    if (copyToClipboard(mockQrCodeText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="text-center space-y-6">
      <p className="text-sm text-gray-600 border-l-4 border-purple-500 pl-3 py-1 bg-purple-50 rounded-r-md">
        Quét mã QR dưới đây bằng ứng dụng **Momo** hoặc **ZaloPay** để thanh toán.
      </p>
      
      {/* Mock QR Code  */}
      <div className="flex justify-center my-6">
        <div className="p-4 border-8 border-purple-500 bg-white shadow-xl rounded-xl">
          <QrCode className="w-32 h-32 md:w-48 md:h-48 text-gray-800" />
        </div>
      </div>
      
      <p className="text-lg font-bold text-gray-700">
        Tổng tiền: <span className="text-purple-600">{amount} {currency?.toUpperCase()}</span>
      </p>

      <Button onClick={handleSubmit} disabled={loading} variant="orange" className="w-full text-lg shadow-lg bg-purple-600 hover:bg-purple-700">
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang chờ xác nhận...</>
          ) : (
            "Mở Ví điện tử và Quét Mã"
          )}
      </Button>
      
      <Button variant="outline" onClick={handleCopy} size="sm" className="mt-2 w-full">
        <ClipboardCopy className="w-4 h-4 mr-2" /> 
        {copied ? "Đã sao chép mã thanh toán!" : "Sao chép mã thanh toán"}
      </Button>
    </div>
  );
}

function BankPaymentDisplay({ loading, handleSubmit, amount, currency }) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const bankInfo = {
    accountName: "CONG TY CP HANG KHONG QAIRLINE",
    accountNumber: "9876543210",
    bankName: "VIETCOMBANK (VCB)",
    content: `QAIRLINE THANH TOAN BOOKING [ID_CUABAN]`
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
        Vui lòng chuyển khoản chính xác **Số tiền** và **Nội dung** dưới đây.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Số Tài khoản */}
        <InfoItem 
            label="Ngân hàng" 
            value={bankInfo.bankName} 
            color="text-green-700"
            copyText={bankInfo.bankName}
            copied={copiedAccount}
            onCopy={() => handleCopy(bankInfo.bankName, setCopiedAccount)}
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
            value={`${amount} ${currency?.toUpperCase()}`} 
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
        <p className="text-xs text-gray-500 mt-1">
          Lưu ý: Thay thế `[ID_CUABAN]` bằng mã booking thực tế của bạn.
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
              <p>1. **Thực hiện chuyển khoản** qua Mobile Banking hoặc ATM.</p>
              <p>2. **Điền chính xác** số tiền và nội dung chuyển khoản như trên.</p>
              <p>3. Nhấn **"Tôi đã thanh toán"** để hệ thống bắt đầu kiểm tra.</p>
          </div>
      )}

      <Button onClick={handleSubmit} disabled={loading} variant="orange" className="w-full text-lg shadow-lg">
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang chờ xác nhận...</>
          ) : (
            "Tôi đã thanh toán qua Ngân hàng"
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
                        {copied ? 'Đã sao chép' : <ClipboardCopy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

export function PaymentStep({
  onPaymentSuccess,
  onBack,
  bookingId = "QABOOK12345", // Mock data if props are missing
  amount = 2500000,
  currency = "VND",
}) {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  
  // Simulate API initialization delay
  useEffect(() => {
    setTimeout(() => setReady(true), 500);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage("");

    // Mock payment confirmation
    setTimeout(() => {
      setMessage("Thanh toán thành công! Vé máy bay điện tử đã được gửi đến email của bạn.");
      setLoading(false);
      // Only proceed if the success message is set
      setTimeout(() => onPaymentSuccess(), 500); 
    }, 2500); // Simulate 2.5 second processing time
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return <CardPaymentForm loading={loading} handleSubmit={handleSubmit} amount={amount} currency={currency} />;
      case 'e-wallet':
        return <EWalletPaymentDisplay loading={loading} handleSubmit={handleSubmit} amount={amount} currency={currency} />;
      case 'bank':
        return <BankPaymentDisplay loading={loading} handleSubmit={handleSubmit} amount={amount} currency={currency} />;
      default:
        return <p className="text-red-500">Vui lòng chọn phương thức thanh toán.</p>;
    }
  };

  if (!ready) {
      return (
          <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="ml-3 text-gray-600">Đang tải giao diện thanh toán...</p>
          </div>
      );
  }

  // --- Success View ---
  if (message.includes("Thanh toán thành công")) {
    return (
      <div className="text-center p-12 bg-green-50 rounded-lg shadow-xl border-t-4 border-green-500">
        <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Giao Dịch Hoàn Tất!</h1>
        <p className="text-lg text-gray-700 mb-6">{message}</p>
        <p className="text-sm text-gray-500">Mã Booking: <span className="font-mono font-semibold text-gray-700">{bookingId}</span></p>
        <Button variant="orange" className="mt-6 text-lg" onClick={onPaymentSuccess}>
          Xem Chi Tiết Booking
        </Button>
      </div>
    );
  }

  // --- Payment View ---
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
      <h1 className="text-3xl font-bold text-gray-900 text-center">Hoàn tất Thanh toán</h1>
      
      {/* Payment Summary */}
      <Card className="shadow-lg border-2 border-orange-400 bg-orange-50">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">Mã Booking</p>
            <p className="font-mono text-lg font-semibold text-orange-700">{bookingId}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm font-medium text-gray-600">Số tiền cần thanh toán</p>
            <p className="text-3xl font-extrabold text-red-600">
              {amount.toLocaleString('vi-VN')} <span className="text-xl">{currency?.toUpperCase()}</span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lựa chọn phương thức thanh toán */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Chọn Phương Thức</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 hover:shadow-md",
                    selectedMethod === option.id
                      ? "border-orange-500 bg-orange-100/70 shadow-lg"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setSelectedMethod(option.id);
                    setMessage(""); // Clear message on method change
                  }}
                >
                  <option.icon className={cn("h-6 w-6 flex-shrink-0", selectedMethod === option.id ? "text-orange-500" : "text-gray-500")} />
                  <div>
                    <p className="font-semibold text-gray-800">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Chi tiết form/thông tin thanh toán */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-t-4 border-gray-300">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-2xl text-gray-800">
                {paymentOptions.find(o => o.id === selectedMethod)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderPaymentForm()}
              {/* Message Display (Error or Success) */}
              {message && (
                <div className={cn("mt-4 p-3 rounded-lg font-medium", message.includes("thành công") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Button onClick={onBack} variant="outline" className="mt-8 w-full text-lg shadow-md hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 mr-2" /> Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}