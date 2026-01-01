import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreditCard, Wallet, Banknote, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: 'vnpay', label: 'Cổng thanh toán VNPAY', icon: Wallet, description: 'Quét QR, Thẻ ATM, Visa/Master.' },
  { id: 'bank_transfer', label: 'Chuyển khoản Ngân hàng', icon: Banknote, description: 'Chuyển khoản thủ công vào STK công ty.' },
];

export default function PaymentMethods({ selectedMethod, onSelect }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Chọn phương thức thanh toán</CardTitle>
        <CardDescription>Chọn phương thức phù hợp với bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {OPTIONS.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelect(option.id)}
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
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              selectedMethod === option.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
            )}>
              {selectedMethod === option.id && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}