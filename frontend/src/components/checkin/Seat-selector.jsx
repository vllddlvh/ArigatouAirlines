'use client';

import React, { useState, useMemo } from "react";
import { MdChair } from "react-icons/md";
import { User, Info, CheckCircle2, XCircle, ArrowRight, PlaneTakeoff, Users, AlertCircle } from 'lucide-react'; // Thêm icons từ Lucide
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Helper function để phân nhóm ghế theo hàng
const groupSeatsByRow = (seats) => {
  const rows = {};
  seats.forEach(seat => {
    const rowNum = parseInt(seat.id.match(/\d+/)[0]);
    if (!rows[rowNum]) {
      rows[rowNum] = [];
    }
    rows[rowNum].push(seat);
  });
  return rows;
};

export default function SeatSelector({ seats: initialSeats, passengers, onSeatSelect }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tempSelectedSeatId, setTempSelectedSeatId] = useState(null); // Đổi tên để rõ ràng hơn
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Memoize ghế để tránh re-render không cần thiết
  const availableSeatsMap = useMemo(() => {
    return new Map(initialSeats.map(seat => [seat.id, seat]));
  }, [initialSeats]);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleSeatClick = (seatId) => {
    const seat = availableSeatsMap.get(seatId);
    if (seat?.type === "available" && selectedCustomer) {
      setTempSelectedSeatId(seatId);
      setIsDialogOpen(true);
    }
  };

  const confirmSeatSelection = () => {
    if (tempSelectedSeatId && selectedCustomer) {
      onSeatSelect(tempSelectedSeatId, selectedCustomer.id);
      setIsDialogOpen(false);
      setTempSelectedSeatId(null);
      setSelectedCustomer(null); // Reset selected customer sau khi chọn
    }
  };

  // Group seats by row for rendering
  const rowsData = useMemo(() => groupSeatsByRow(initialSeats), [initialSeats]);
  const rowNumbers = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b));
  const columnLabels = ["A", "B", "C", "D", "E", "G"]; // Định nghĩa các cột

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Panel - Customer List & Legend */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="shadow-lg border-t-4 border-orange-500">
            <CardHeader className="p-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Users className="h-5 w-5 text-orange-500" /> Danh Sách Hành Khách
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {passengers.map((customer) => (
                  <li
                    key={customer.id}
                    className={cn(
                      "flex items-center justify-between text-base p-3 rounded-lg cursor-pointer transition-all duration-200",
                      selectedCustomer?.id === customer.id
                        ? "bg-orange-100 border-l-4 border-orange-500 shadow-sm"
                        : "hover:bg-gray-100 hover:shadow-xs",
                      customer.seat ? "text-gray-700" : "text-gray-900 font-medium"
                    )}
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" /> {customer.name}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold px-2 py-1 rounded-full",
                        customer.seat ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {customer.seat || "Chưa chọn ghế"}
                    </span>
                  </li>
                ))}
              </ul>
              {passengers.every(p => p.seat) && (
                <p className="mt-4 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Tất cả hành khách đã có ghế.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-gray-300">
            <CardHeader className="p-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Info className="h-5 w-5 text-blue-500" /> Chú Giải Sơ Đồ Ghế
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <LegendItem icon={<MdChair size={24} />} colorClass="text-blue-500 bg-blue-100 border-blue-400" label="Ghế của hành khách đã chọn" />
                <LegendItem icon={<MdChair size={24} />} colorClass="text-green-500 bg-green-100 border-green-400" label="Ghế đã được chọn (bởi người khác)" />
                <LegendItem icon={<MdChair size={24} />} colorClass="text-gray-700 bg-gray-100 border-gray-300" label="Ghế còn trống" />
                <LegendItem icon={<MdChair size={24} />} colorClass="text-amber-500 bg-amber-50 border-amber-200" label="Ghế đã có người/không khả dụng" />
                <LegendItem icon={<MdChair size={24} />} colorClass="text-red-500 bg-red-100 border-red-400" label="Ghế bị chặn/không thể chọn" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Seat Map */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-100 to-transparent opacity-50 z-0"></div> {/* Hiệu ứng phía trước */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-blue-100 to-transparent opacity-50 z-0"></div> {/* Hiệu ứng phía sau */}

          {/* Cabin Head */}
          <div className="flex justify-center mb-8 relative z-10">
            <PlaneTakeoff className="h-16 w-16 text-gray-400 rotate-90" />
          </div>
          <p className="text-center text-lg font-semibold text-gray-700 mb-6 relative z-10">
            {selectedCustomer ? (
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full shadow-sm flex items-center justify-center gap-2">
                <User className="h-5 w-5" /> Đang chọn ghế cho: <span className="font-bold">{selectedCustomer.name}</span>
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-sm flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" /> Vui lòng chọn một hành khách để bắt đầu
              </span>
            )}
          </p>

          <div className="relative overflow-auto flex-1 custom-scrollbar pb-4 -mx-6 px-6"> {/* Thêm padding ngang */}
            <div className="inline-grid grid-cols-[auto_repeat(6,minmax(0,1fr))_auto] gap-x-2 gap-y-3 mx-auto min-w-full">
              {/* Column Headers */}
              <div className="col-span-1"></div> {/* Empty for row numbers */}
              {columnLabels.map((col) => (
                <div key={col} className="flex items-center justify-center h-8 text-sm font-bold text-gray-600">
                  {col}
                </div>
              ))}
              <div className="col-span-1"></div> {/* Empty for row numbers */}

              {/* Seats Grid */}
              {rowNumbers.map((rowNum) => (
                <React.Fragment key={`row-${rowNum}`}>
                  {/* Left Row Number */}
                  <div className="flex items-center justify-end h-8 text-sm font-bold text-gray-500 pr-2">
                    {rowNum}
                  </div>
                  
                  {columnLabels.map((col) => {
                    const seatId = `${rowNum}${col}`;
                    const seat = availableSeatsMap.get(seatId);
                    const isSeatSelectedByCustomer = passengers.some(p => p.seat === seatId && p.id === selectedCustomer?.id);
                    const isSeatOccupiedByOther = passengers.some(p => p.seat === seatId && p.id !== selectedCustomer?.id);
                    
                    let seatClass = "";
                    let seatType = seat?.type; // Dùng seat.type gốc
                    let isDisabled = !selectedCustomer || seatType === "blocked" || seatType === "unavailable" || isSeatOccupiedByOther;

                    if (isSeatSelectedByCustomer) {
                        seatClass = "bg-blue-200 border-blue-500 text-blue-700 shadow-md"; // Ghế của khách hàng đang chọn
                        isDisabled = true; // Không cho chọn lại ghế của chính mình
                    } else if (isSeatOccupiedByOther) {
                        seatClass = "bg-green-100 border-green-400 text-green-600 cursor-not-allowed"; // Ghế đã được chọn bởi người khác
                        isDisabled = true;
                    } else if (seatType === "available") {
                        seatClass = "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400";
                    } else if (seatType === "unavailable") {
                        seatClass = "bg-amber-50 border-amber-200 text-amber-500 cursor-not-allowed";
                    } else if (seatType === "blocked") {
                        seatClass = "bg-red-50 border-red-200 text-red-500 cursor-not-allowed";
                    }

                    return (
                      <div key={seatId} className="flex items-center justify-center">
                        <button
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isDisabled}
                          className={cn(
                            "w-10 h-10 rounded-md transition-all duration-200 flex items-center justify-center text-lg relative group",
                            "border-2", // Thêm border cho tất cả
                            seatClass,
                            isDisabled ? "opacity-60" : "cursor-pointer"
                          )}
                        >
                          <MdChair size={28} />
                          {!isDisabled && (
                            <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap">
                              {seatId}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                  {/* Right Row Number */}
                  <div className="flex items-center justify-start h-8 text-sm font-bold text-gray-500 pl-2">
                    {rowNum}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Action buttons for seat map if needed (optional) */}
          <div className="flex justify-center mt-8 relative z-10">
            <Button 
                variant="orange" 
                onClick={() => setSelectedCustomer(null)} 
                disabled={!selectedCustomer}
                className="px-8 py-3 text-lg font-semibold shadow-lg"
            >
                <XCircle className="h-5 w-5 mr-2" /> Hủy Chọn Khách Hàng
            </Button>
          </div>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" /> Xác nhận chọn ghế
            </DialogTitle>
            <DialogDescription>
              Bạn đã chọn ghế <span className="font-bold text-orange-600">{tempSelectedSeatId}</span> cho <span className="font-bold text-blue-600">{selectedCustomer?.name}</span>. Bạn có chắc chắn muốn chọn ghế này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="px-5">
              Hủy bỏ
            </Button>
            <Button variant="orange" onClick={confirmSeatSelection} className="px-5">
              Xác nhận <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component con cho Legend Item
function LegendItem({ icon, colorClass, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 flex items-center justify-center border-2 rounded-lg shadow-sm transition-transform duration-200",
        colorClass
      )}>
        {icon}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}