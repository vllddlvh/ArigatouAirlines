import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function BookingSummary({ 
  bookingData, 
  voucherCode, 
  setVoucherCode, 
  handleApplyVoucher, 
  isApplyingVoucher, 
  voucherDiscountAmount 
}) {
  const baseTotal = bookingData.baseTotalAmount ?? bookingData.totalAmount;
  
  return (
    <Card className="sticky top-6 h-fit">
      <CardHeader>
        <CardTitle>Tổng thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voucher Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mã giảm giá</label>
          <div className="flex gap-2">
            <Input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Nhập mã voucher"
              disabled={isApplyingVoucher}
            />
            <Button
              variant="outline"
              onClick={handleApplyVoucher}
              disabled={isApplyingVoucher}
            >
              {isApplyingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng"}
            </Button>
          </div>
        </div>

        {/* Calculation */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span>{formatCurrency(baseTotal)}</span>
          </div>
          {voucherDiscountAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Giảm giá</span>
              <span className="text-green-600">- {formatCurrency(voucherDiscountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-orange-600">{formatCurrency(bookingData.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}