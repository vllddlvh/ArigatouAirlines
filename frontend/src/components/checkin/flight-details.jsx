import { Plane, Calendar, Clock, Users, CreditCard, FlameKindling, Droplet, Scissors, FlaskConical, ZapOff, Radiation, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator" // Import Separator
import { cn } from "@/lib/utils" // Import cn utility để dễ dàng merge classNames

// Component con cho từng chi tiết chuyến bay
function FlightSegmentDisplay({ type, flightDetails, passengerCount }) {
  const isReturn = type === "Chuyến về";
  const directionIcon = isReturn ? <ArrowRight className="h-5 w-5 rotate-180" /> : <ArrowRight className="h-5 w-5" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Plane className="h-6 w-6 text-orange-500" /> {type}
        </h3>
        <span className="text-sm font-medium text-gray-500 bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
          {flightDetails.flightNumber}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departure */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="h-4 w-4 text-gray-400" /> Ngày
          </p>
          <p className="text-lg font-semibold text-gray-800">{flightDetails.date}</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{flightDetails.departureTime}</p>
          <p className="text-base text-gray-700 font-medium">{flightDetails.from}</p>
        </div>

        {/* Arrival */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <Clock className="h-4 w-4 text-gray-400" /> Đến
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {isReturn ? flightDetails.date : flightDetails.date} {/* Có thể thay đổi nếu chuyến về có ngày khác */}
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{flightDetails.arrivalTime}</p>
          <p className="text-base text-gray-700 font-medium">{flightDetails.to}</p>
        </div>
      </div>

      <Separator className="my-6 bg-gray-200" />

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span><strong className="text-gray-900">Thời gian bay:</strong> {flightDetails.duration}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span><strong className="text-gray-900">Hành khách:</strong> {passengerCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <span><strong className="text-gray-900">Thanh toán:</strong> Thẻ tín dụng</span>
        </div>
        {/* Thêm các chi tiết khác nếu cần */}
      </div>
    </div>
  );
}

// Danh sách vật phẩm bị cấm (giữ nguyên)
const prohibitedItems = [
  { icon: FlameKindling, label: "Vật dễ cháy" },
  { icon: Droplet, label: "Chất lỏng" },
  { icon: Scissors, label: "Vật sắc nhọn" },
  { icon: FlaskConical, label: "Hóa chất" },
  { icon: ZapOff, label: "Chất nổ" },
  { icon: Radiation, label: "Vật liệu phóng xạ" },
];

export function FlightDetailsStep({
  flightDetails,
  returnFlightDetails,
  passengerCount,
  onContinue,
  onCancel,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Tiêu đề chính */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Xác Nhận Chi Tiết Chuyến Bay</h1>
          <p className="text-lg text-gray-600">Kiểm tra thông tin chuyến đi của bạn trước khi tiếp tục.</p>
        </div>

        {/* Thẻ chính cho chuyến đi và chuyến về */}
        <Card className="shadow-2xl border-2 border-orange-400 bg-white p-6 md:p-8">
          <CardContent className="p-0 space-y-10">
            {/* Chi tiết chuyến đi */}
            <FlightSegmentDisplay
              type="Chuyến đi"
              flightDetails={flightDetails}
              passengerCount={passengerCount}
            />

            {/* Dấu phân cách giữa chuyến đi và chuyến về */}
            {returnFlightDetails && (
              <div className="relative flex items-center justify-center py-4">
                <Separator className="w-full bg-gray-200" />
                <span className="absolute bg-white px-4 text-sm font-medium text-gray-500 rounded-full border border-gray-200 shadow-sm">
                  Chuyến bay khứ hồi
                </span>
              </div>
            )}

            {/* Chi tiết chuyến về (nếu có) */}
            {returnFlightDetails && (
              <FlightSegmentDisplay
                type="Chuyến về"
                flightDetails={returnFlightDetails}
                passengerCount={passengerCount}
              />
            )}
          </CardContent>
        </Card>

        {/* Các vật phẩm bị cấm */}
        <Card className="shadow-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ZapOff className="h-7 w-7 text-red-500" /> Các Vật Phẩm Bị Cấm
            </CardTitle>
            <CardDescription>
              Vui lòng đảm bảo hành lý của bạn không chứa các vật phẩm sau để chuyến đi an toàn.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {prohibitedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-3 bg-red-50 rounded-lg border border-red-200 transition-all duration-300 hover:shadow-md hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-red-400 bg-white flex items-center justify-center mb-2">
                    <item.icon className="w-7 h-7 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nút hành động */}
        <div className="flex justify-center gap-6 mt-10">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8 py-3 text-lg font-semibold border-gray-300 hover:bg-gray-100 transition-all duration-300 shadow-md"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="orange"
            onClick={onContinue}
            className="px-8 py-3 text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-300"
          >
            Tiếp tục thanh toán <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}