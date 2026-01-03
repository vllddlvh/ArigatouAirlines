'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { CheckCircle2, XCircle, Loader2, Home, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState('loading'); 

  useEffect(() => {

    const statusParam = searchParams.get('status');
    const timer = setTimeout(() => {
        if (statusParam === 'Success') {
            setPaymentStatus('success');
        } else {
            setPaymentStatus('failed');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Điều hướng
  const handleViewBookings = () => router.push('/my-bookings');
  const handleGoHome = () => router.push('/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
        
        {/* TRẠNG THÁI: LOADING */}
        {paymentStatus === 'loading' && (
          <div className="py-10">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-700">Đang xử lý kết quả...</h2>
            <p className="text-gray-500 mt-2">Vui lòng không tắt trình duyệt.</p>
          </div>
        )}

        {/* TRẠNG THÁI: SUCCESS */}
        {paymentStatus === 'success' && (
          <div className="py-6">
            <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10 bg-white rounded-full" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-700 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã đặt vé. Thông tin chi tiết đã được gửi tới email của bạn.
            </p>
            
            <div className="space-y-3">
                <Button 
                    onClick={handleViewBookings} 
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                >
                    <Ticket className="mr-2 w-5 h-5" /> Xem vé của tôi
                </Button>
                <Button 
                    onClick={handleGoHome} 
                    variant="ghost" 
                    className="w-full text-gray-500 hover:text-gray-800"
                >
                    Về trang chủ
                </Button>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI: FAILED */}
        {paymentStatus === 'failed' && (
          <div className="py-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 shadow-red-100 drop-shadow-xl" />
            
            <h2 className="text-2xl font-bold text-red-700 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8">
              Giao dịch bị hủy hoặc xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại.
            </p>
            
            <div className="space-y-3">
                <Button 
                    onClick={handleGoHome} 
                    className="w-full bg-gray-900 hover:bg-gray-800 h-12 text-lg"
                >
                    <Home className="mr-2 w-5 h-5" /> Về trang chủ
                </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}