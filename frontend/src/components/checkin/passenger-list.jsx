'use client';

import { User, UserCheck, Plane, ArrowLeft, ArrowRight, Briefcase, Smile, Tag, Baby } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Giả định đã có

// Component con cho từng hành khách
function PassengerCard({ passenger, flightType }) {
  const isBusiness = passenger.type === "business";
  const isChild = passenger.ageGroup === "child"; // Giả định có ageGroup
  const isInfant = passenger.ageGroup === "infant";

  const getPassengerIcon = () => {
    if (isInfant) return <Baby className="h-6 w-6 text-pink-500" />;
    if (isChild) return <Smile className="h-6 w-6 text-yellow-600" />;
    return <UserCheck className="h-6 w-6 text-blue-500" />;
  };

  const getCardClasses = () => {
    if (isBusiness) {
      return "bg-amber-50 border-amber-300 shadow-md hover:bg-amber-100";
    }
    return "bg-white border-gray-200 hover:bg-gray-50";
  };

  return (
    <div className={`p-4 border rounded-xl transition-all duration-200 ${getCardClasses()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getPassengerIcon()}
          <div>
            <div className="font-semibold text-lg text-gray-900">
              {passenger.title} {passenger.name}
            </div>
            {/* Giả định có thêm thông tin số ghế hoặc hạng vé */}
            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Tag className="h-4 w-4" />
              <span>{isBusiness ? "Hạng Thương gia" : "Hạng Phổ thông"}</span>
              {passenger.seat && <span className="ml-2 font-medium text-orange-600">| Ghế: {passenger.seat}</span>}
            </div>
          </div>
        </div>
        
        {isBusiness && (
            <div className="hidden sm:flex items-center text-sm font-medium text-amber-800 bg-amber-200 px-3 py-1 rounded-full">
                <Briefcase className="h-4 w-4 mr-1" /> BUSINESS
            </div>
        )}
      </div>
    </div>
  );
}

export function PassengerListStep({ passengers, onContinue, onBack }) {
  const hasReturnFlight = passengers.return && passengers.return.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-t-4 border-orange-500">
        <CardHeader className="bg-white p-6 border-b">
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-8 w-8 text-orange-500" />
            Xác Nhận Hành Khách
          </CardTitle>
          <CardDescription>
            Vui lòng kiểm tra lại danh sách và chi tiết hạng ghế của từng hành khách.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          
          {/* Khu vực Chi tiết chuyến đi */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-orange-600 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <Plane className="h-6 w-6 rotate-45" /> Chuyến đi
            </h3>
            <div className="space-y-4">
              {passengers.departure.length > 0 ? (
                passengers.departure.map((passenger) => (
                  <PassengerCard key={passenger.id} passenger={passenger} flightType="departure" />
                ))
              ) : (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    ⚠️ Danh sách hành khách chuyến đi đang trống.
                </div>
              )}
            </div>
          </div>

          {/* Dấu phân cách nếu có chuyến về */}
          {hasReturnFlight && (
            <div className="relative flex items-center justify-center my-6">
              <Separator className="w-full bg-gray-200" />
              <span className="absolute bg-gray-50 px-4 text-sm font-medium text-gray-600 rounded-full border border-gray-300 shadow-sm">
                <ArrowRight className="h-4 w-4 inline mr-1" /> Chuyến Khứ Hồi <ArrowLeft className="h-4 w-4 inline ml-1" />
              </span>
            </div>
          )}

          {/* Khu vực Chi tiết chuyến về (nếu có) */}
          {hasReturnFlight && (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-blue-600 border-l-4 border-blue-500 pl-3 flex items-center gap-2">
                <Plane className="h-6 w-6 rotate-225" /> Chuyến về
              </h3>
              <div className="space-y-4">
                {passengers.return.map((passenger) => (
                  <PassengerCard key={passenger.id} passenger={passenger} flightType="return" />
                ))}
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex justify-between gap-4 pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={onBack} className="px-6 py-3 text-lg font-medium shadow-md">
              <ArrowLeft className="h-5 w-5 mr-2" /> Quay Lại
            </Button>
            <Button 
                variant="orange" 
                onClick={onContinue} 
                className="px-6 py-3 text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-300"
            >
              Tiếp Tục Thanh Toán <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}