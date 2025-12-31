'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Ticket, Download, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Giả định utility cn có sẵn

// --- SUB-COMPONENTS (MOCKUP) ---

// Component thay thế cho FlightDetailCard (Phiên bản Boarding Pass Summary)
function FlightSummaryCard({ type, flightNumber, departureCity, arrivalCity, date }) {
    const isReturn = type === 'Chuyến về';
    const borderColor = isReturn ? 'border-blue-500' : 'border-orange-500';

    return (
        <Card className={cn("relative p-6 shadow-xl overflow-hidden mb-4", borderColor)}>
            <div className={cn("absolute inset-y-0 left-0 w-2 bg-gradient-to-b", isReturn ? "from-blue-400 to-blue-600" : "from-orange-400 to-orange-600")}></div>
            <div className="flex justify-between items-start">
                <div>
                    <span className={cn("text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full", isReturn ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")}>
                        {type}
                    </span>
                    <CardTitle className="text-3xl font-extrabold mt-1 text-gray-900">
                        {departureCity} <ArrowRight className="inline h-5 w-5 mx-2 text-gray-500" /> {arrivalCity}
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-600">
                        Chuyến bay: <span className="font-mono font-semibold">{flightNumber}</span> | Ngày: {date}
                    </CardDescription>
                </div>
                <Ticket className={cn("h-10 w-10 opacity-70 flex-shrink-0", isReturn ? "text-blue-500" : "text-orange-500")} />
            </div>
        </Card>
    );
}

// Component thay thế cho FlightInfoCard (Phiên bản Boarding Pass Mini)
function PassengerTicketCard({ passengerName, seatNumber, onDownload }) {
    return (
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-green-500 bg-white">
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-gray-500" />
                    <div>
                        <p className="font-semibold text-gray-800">{passengerName}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            Ghế: <span className="font-bold text-green-600">{seatNumber}</span>
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => alert(`Xem chi tiết vé của ${passengerName}`)} className="text-blue-600 hover:bg-blue-50">
                        <FileText className="h-4 w-4 mr-1" /> Xem
                    </Button>
                    <Button variant="orange" size="sm" onClick={onDownload}>
                        <Download className="h-4 w-4 mr-1" /> Tải Vé
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


// --- MAIN COMPONENT REDESIGN ---

export function FlightSection({
  type,
  flightNumber,
  departureTime,
  arrivalTime,
  departureCity,
  arrivalCity,
  date,
  duration,
  passengers,
  paymentMethod,
  passengerDetails,
  ticketRef,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // --- MOCK Data for demonstration (Remove in production) ---
  const totalPassengers = 3;
  const bookingReference = "QREF12345";
  // --- END MOCK ---

  return (
    <div className="mb-10 p-5 bg-white rounded-xl shadow-2xl border border-gray-100">
      
      {/* 1. Phần Tổng quan (Boarding Pass Summary) */}
      <FlightSummaryCard
        type={type}
        flightNumber={flightNumber}
        departureCity={departureCity}
        arrivalCity={arrivalCity}
        date={date}
      />

      {/* Thông tin chi tiết chuyến bay (Hiển thị cố định) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pb-3 border-b border-dashed border-gray-300">
        <InfoBox label="Giờ khởi hành" value={departureTime} />
        <InfoBox label="Giờ đến" value={arrivalTime} />
        <InfoBox label="Số lượng khách" value={`${totalPassengers} Người`} />
        <InfoBox label="Tham chiếu vé" value={bookingReference} valueClass="font-mono text-orange-600" />
      </div>

      {/* 2. Phần Chi tiết (Collapsible) */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 mt-4 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <span className="text-sm font-semibold">
              {isOpen ? 'Ẩn Danh sách vé chi tiết' : 'Xem Danh sách vé chi tiết'}
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          <Separator className="my-3 bg-gray-200" />
          <h3 className="text-lg font-bold text-gray-800 mb-3">Vé Cá Nhân ({passengerDetails.length} vé)</h3>
          
          {/* Bố cục lưới cho các thẻ vé chi tiết */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passengerDetails.map((detail, index) => (
              <PassengerTicketCard
                key={index}
                passengerName={`${detail.firstName} ${detail.lastName}`}
                seatNumber={detail.seatCode || 'Tự check-in'}
                onDownload={detail.onDownload || (() => alert(`Tải vé ${detail.firstName}`)) }
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Component phụ trợ cho thông tin dạng box
function InfoBox({ label, value, valueClass = "text-gray-800" }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
            <span className={cn("text-base font-semibold mt-1", valueClass)}>{value}</span>
        </div>
    );
}