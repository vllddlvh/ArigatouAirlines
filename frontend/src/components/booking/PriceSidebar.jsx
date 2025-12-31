import { CreditCard, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PriceSidebar = ({ 
  departureOption, 
  returnOption, 
  passengerCount, 
  totalAmount, 
  isCreating, 
  isReadyToPay, 
  onConfirm 
}) => {
  
  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-6">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Chi tiết thanh toán</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Hành khách</span>
            <span className="font-medium">{passengerCount} người</span>
          </div>
          
          {/* Departure Price Breakdown */}
          {departureOption && (
            <div className="flex justify-between">
              <span className="text-gray-600">Chuyến đi ({departureOption.name})</span>
              <span className="font-medium">{formatMoney(departureOption.price * passengerCount)}</span>
            </div>
          )}

          {/* Return Price Breakdown */}
          {returnOption && (
            <div className="flex justify-between">
              <span className="text-gray-600">Chuyến về ({returnOption.name})</span>
              <span className="font-medium">{formatMoney(returnOption.price * passengerCount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Thuế & Phí</span>
            <span className="font-medium">Đã bao gồm</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-end mb-6">
          <span className="text-gray-600 font-bold">Tổng thanh toán</span>
          <span className="text-2xl font-black text-orange-600">{formatMoney(totalAmount)}</span>
        </div>

        <Button 
          onClick={onConfirm}
          disabled={isCreating || !isReadyToPay}
          className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold shadow-md disabled:opacity-70"
        >
          {isCreating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Đang xử lý...</>
          ) : (
            <><CreditCard className="w-4 h-4 mr-2"/> Xác nhận & Thanh toán</>
          )}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <Shield className="w-3 h-3" />
          Giao dịch được bảo mật 100%
        </div>
      </div>
    </div>
  );
};