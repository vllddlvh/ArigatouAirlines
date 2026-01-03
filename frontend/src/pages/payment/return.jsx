'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Next 13+ hooks
import { verifyVnPayReturn } from "@/services/paymentService";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | success | failed

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    if (!vnp_ResponseCode) return;

    // Chuyển searchParams thành object
    const params = {};
    searchParams.forEach((value, key) => { params[key] = value });

    verifyVnPayReturn(params)
      .then((res) => {
        if (res.status === "OK") {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus('failed');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold">Đang xác thực giao dịch...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">Vé của bạn đã được xuất và gửi qua email.</p>
            <Button onClick={() => router.push('/my-bookings')} className="w-full">
              Xem vé của tôi
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">Có lỗi xảy ra hoặc bạn đã hủy giao dịch.</p>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Về trang chủ
            </Button>
          </>
        )}
      </div>
    </div>
  );
}