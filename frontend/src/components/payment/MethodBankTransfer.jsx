import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Loader2, CheckCircle2, ClipboardCopy, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { confirmPayment } from "@/services/paymentService";

// Helper copy text
const copyToClipboard = (text) => {
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Copy failed", error);
    return false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function MethodBankTransfer({ amount, bookingCode, bookingId,voucherCode,onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // State quản lý feedback khi copy
  const [copiedStates, setCopiedStates] = useState({
    account: false,
    amount: false,
    content: false
  });

  // Thông tin tài khoản ngân hàng (Hardcode hoặc lấy từ Config)
  const bankInfo = {
    bankName: "VIETCOMBANK (VCB)",
    accountName: "CONG TY CP HANG KHONG ARIGATOU",
    accountNumber: "9876543210123",
    content: `ARIGATOU ${bookingCode}`
  };

  const handleCopy = (key, text) => {
    if (copyToClipboard(text)) {
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
      toast({ description: "Đã sao chép vào bộ nhớ tạm" });
    }
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      await confirmPayment(bookingId, voucherCode);
      
      toast({
        title: "Xác nhận thành công!",
        description: "Hệ thống đang xử lý vé của bạn.",
      });

      // Gọi callback để báo cho component cha (PaymentPage) biết đã xong
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi xác nhận",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Cảnh báo quan trọng */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Lưu ý quan trọng:</p>
          <p>Vui lòng chuyển khoản chính xác <strong>Số tiền</strong> và <strong>Nội dung</strong> bên dưới để hệ thống tự động kích hoạt vé.</p>
        </div>
      </div>

      {/* Grid thông tin ngân hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem 
          label="Ngân hàng" 
          value={bankInfo.bankName} 
          color="text-green-700"
        />
        <InfoItem 
          label="Tên tài khoản" 
          value={bankInfo.accountName} 
          color="text-gray-900 uppercase"
        />
        <InfoItem 
          label="Số tài khoản" 
          value={bankInfo.accountNumber} 
          color="text-blue-600 font-mono text-lg"
          allowCopy
          isCopied={copiedStates.account}
          onCopy={() => handleCopy('account', bankInfo.accountNumber)}
        />
        <InfoItem 
          label="Số tiền cần chuyển" 
          value={formatCurrency(amount)} 
          color="text-red-600 font-bold text-lg"
          allowCopy
          isCopied={copiedStates.amount}
          onCopy={() => handleCopy('amount', amount.toString())}
        />
      </div>

      {/* Nội dung chuyển khoản (Phần quan trọng nhất) */}
      <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50/50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-800 text-sm uppercase">Nội dung chuyển khoản (Bắt buộc)</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            onClick={() => handleCopy('content', bankInfo.content)}
          >
            {copiedStates.content ? (
              <><CheckCircle2 className="w-4 h-4 mr-1" /> Đã chép</>
            ) : (
              <><ClipboardCopy className="w-4 h-4 mr-1" /> Sao chép</>
            )}
          </Button>
        </div>
        <div className="font-mono text-xl font-bold text-gray-900 bg-white p-3 rounded border border-orange-200 text-center tracking-wide">
          {bankInfo.content}
        </div>
      </div>

      {/* Nút hướng dẫn chi tiết (Toggle) */}
      <div>
        <Button 
          variant="outline" 
          onClick={() => setShowInstructions(!showInstructions)} 
          className="w-full justify-between text-gray-600"
        >
          Hướng dẫn chi tiết các bước
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {showInstructions && (
          <div className="mt-2 p-4 bg-gray-100 rounded-lg text-sm space-y-2 text-gray-700 animate-in slide-in-from-top-2">
            <p>1. Mở ứng dụng Ngân hàng (Mobile Banking) hoặc ra cây ATM.</p>
            <p>2. Chọn chuyển khoản nhanh 24/7 tới số tài khoản trên.</p>
            <p>3. Nhập đúng số tiền: <strong>{formatCurrency(amount)}</strong>.</p>
            <p>4. Nhập nội dung: <strong>{bankInfo.content}</strong>.</p>
            <p>5. Sau khi chuyển xong, quay lại đây và bấm nút "Tôi đã chuyển khoản".</p>
          </div>
        )}
      </div>

      {/* Nút xác nhận cuối cùng */}
      <Button 
        onClick={handleConfirmTransfer} 
        disabled={loading} 
        className="w-full text-lg shadow-lg bg-orange-600 hover:bg-orange-700 text-white h-12"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xác minh...</>
        ) : (
          "Tôi đã chuyển khoản xong"
        )}
      </Button>
    </div>
  );
}

// Sub-component nhỏ để hiển thị từng dòng thông tin
function InfoItem({ label, value, color, allowCopy, onCopy, isCopied }) {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col justify-center">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={cn("font-semibold truncate", color)}>
          {value}
        </p>
        {allowCopy && (
          <button 
            type="button" 
            onClick={onCopy}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="Sao chép"
          >
            {isCopied ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <ClipboardCopy className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}