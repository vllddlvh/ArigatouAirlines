import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from 'lucide-react';
import { createVnPayUrl } from "@/services/paymentService"; // Import API bạn đã viết
import { useToast } from "@/hooks/use-toast";

export default function MethodVnPay({ amount, voucherCode, bookingId }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVnPayCheckout = async () => {
    setLoading(true);
    try {

      const res = voucherCode
          ? await createVnPayUrl(bookingId, voucherCode)
          : await createVnPayUrl(bookingId);
      
      if (res.status === "OK" && res.url) {
        window.location.href = res.url;
      } else {
        toast({ title: "Lỗi", description: "Không thể tạo liên kết thanh toán.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Lỗi kết nối", description: "Vui lòng thử lại sau.", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 3000); 
    }
  };

  return (
    <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 text-center space-y-4">
      <img 
        src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" 
        alt="VNPAY Logo" 
        className="h-12 mx-auto mb-4" 
      />
      <p className="text-gray-600">
        Bạn sẽ được chuyển hướng đến cổng thanh toán VNPAY để hoàn tất giao dịch an toàn.
        <br/>Hỗ trợ: Thẻ ATM nội địa, QR Code, Visa/Mastercard.
      </p>
      
      <Button 
        onClick={handleVnPayCheckout} 
        disabled={loading}
        className="w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg h-12"
      >
        {loading ? (
          <><Loader2 className="mr-2 animate-spin" /> Đang chuyển hướng...</>
        ) : (
          <><ExternalLink className="mr-2" /> Thanh toán qua VNPAY</>
        )}
      </Button>
    </div>
  );
}