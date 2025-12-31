'use client';

import React, { useState, useMemo } from "react";
import { MdChair, MdAirlineSeatReclineExtra } from "react-icons/md"; // Thêm icon ghế thương gia
import { User, Info, CheckCircle2, XCircle, ArrowRight, PlaneTakeoff, Users, AlertCircle, Armchair } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";

// Helper: Group ghế theo visualRow từ API
const groupSeatsByRow = (seats) => {
  const rows = {};
  if (!Array.isArray(seats)) return rows;
  
  seats.forEach(seat => {
    const rowNum = seat.visualRow; // Dùng visualRow từ API
    if (!rows[rowNum]) {
      rows[rowNum] = [];
    }
    rows[rowNum].push(seat);
  });
  return rows;
};



export default function SeatSelector({ seats: initialSeats, passengers, onSeatSelect }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tempSelectedSeat, setTempSelectedSeat] = useState(null); // Lưu cả object seat
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // 1. Tạo Map để tra cứu nhanh: Key = "visualRow-visualCol"
  const seatMap = useMemo(() => {
    const map = new Map();
    initialSeats.forEach(seat => {
      // Key unique theo tọa độ
      map.set(`${seat.visualRow}-${seat.visualCol}`, seat);
    });
    return map;
  }, [initialSeats]);

  // 2. Lấy danh sách hàng và sắp xếp
  const rowsData = useMemo(() => groupSeatsByRow(initialSeats), [initialSeats]);
  const rowNumbers = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b));

  // 3. Cấu hình cột (Giả định máy bay 6 cột từ API)
  const TOTAL_COLS = 6; 
  const colIndices = Array.from({ length: TOTAL_COLS }, (_, i) => i + 1); // [1, 2, 3, 4, 5, 6]

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleSeatClick = (seat) => {
    // Logic check: Phải chọn khách trước & ghế phải available
    // Lưu ý: Parent component cần map field 'booked' thành type='blocked' hoặc 'available'
    if (seat?.type === "available" && selectedCustomer) {
      setTempSelectedSeat(seat);
      setIsDialogOpen(true);
    }
  };

  const confirmSeatSelection = () => {
    if (tempSelectedSeat && selectedCustomer) {
      onSeatSelect(tempSelectedSeat.seatNumber, selectedCustomer.id);
      setIsDialogOpen(false);
      setTempSelectedSeat(null);
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* --- LEFT PANEL: DANH SÁCH KHÁCH & CHÚ THÍCH --- */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Danh sách hành khách */}
          <Card className="shadow-md border-t-4 border-orange-500 bg-white">
            <CardHeader className="p-4 border-b bg-orange-50/30">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Users className="h-5 w-5 text-orange-600" /> Danh Sách Hành Khách
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {passengers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      selectedCustomer?.id === customer.id
                        ? "bg-orange-50 border-orange-400 shadow-md ring-1 ring-orange-200"
                        : "bg-white border-gray-200 hover:border-orange-300 hover:bg-gray-50",
                      customer.seat && "bg-green-50/50 border-green-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-full", customer.seat ? "bg-green-100" : "bg-gray-100")}>
                        <User className={cn("h-4 w-4", customer.seat ? "text-green-600" : "text-gray-500")} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{customer.fullName}</div>
                        <div className="text-xs text-gray-500">{customer.type === 'adult' ? 'Người lớn' : 'Trẻ em'}</div>
                      </div>
                    </div>
                    
                    {customer.seat ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            {customer.seat}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
                            Chưa chọn
                        </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chú thích (Legend) */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-gray-700">
                <Info className="h-4 w-4" /> Chú Giải
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <LegendItem color="bg-orange-500 border-orange-600" label="Đang chọn" />
                <LegendItem color="bg-blue-600 border-blue-700" label="Ghế của bạn" />
                <LegendItem color="bg-gray-300 border-gray-400" label="Đã có người" />
                <LegendItem color="bg-white border-purple-300 text-purple-600" label="Thương gia" isOutline />
                <LegendItem color="bg-white border-blue-300 text-blue-500" label="Phổ thông" isOutline />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT PANEL: SƠ ĐỒ GHẾ --- */}
        <div className="flex-1 flex flex-col items-center">
            
          {/* Header trạng thái */}
          <div className="mb-6 w-full text-center">
             {selectedCustomer ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600  rounded-full shadow-lg animate-in fade-in slide-in-from-top-4">
                <User className="h-5 w-5" /> 
                <span>Đang chọn ghế cho: <strong>{selectedCustomer.fullName}</strong></span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm">
                <AlertCircle className="h-5 w-5" /> 
                <span>Vui lòng chọn hành khách bên trái để bắt đầu</span>
              </div>
            )}
          </div>

          {/* MÔ HÌNH MÁY BAY */}
          <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 p-8 pb-20 w-full max-w-3xl overflow-hidden">
            
            {/* Buồng lái decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-gray-200 to-white rounded-b-full opacity-50"></div>
            <div className="flex justify-center mb-10 text-gray-300">
                <PlaneTakeoff size={48} />
            </div>

            {/* GRID GHẾ */}
            <div className="flex flex-col gap-3 items-center">
                
                {/* Header Cột (A B C - D E F) */}
                <div className="flex gap-4 mb-2">
                    {/* Cánh trái (A B C) */}
                    <div className="flex gap-2">
                        {['A', 'B', 'C'].map(char => (
                            <div key={char} className="w-10 text-center font-bold text-gray-400">{char}</div>
                        ))}
                    </div>
                    {/* Lối đi (Spacer) */}
                    <div className="w-8"></div>
                    {/* Cánh phải (D E F) */}
                    <div className="flex gap-2">
                        {['D', 'E', 'F'].map(char => (
                            <div key={char} className="w-10 text-center font-bold text-gray-400">{char}</div>
                        ))}
                    </div>
                </div>

                {/* Render Từng Hàng */}
                {rowNumbers.map((rowNum) => (
                   <div key={rowNum} className="flex items-center gap-4 group">
                        
                        {/* Số hàng bên trái */}
                        <div className="w-6 text-right text-xs font-bold text-gray-300 group-hover:text-gray-500 transition-colors">
                            {rowNum}
                        </div>

                        {/* Các ghế trong hàng */}
                        <div className="flex gap-2">
                             {/* Loop Col 1-3 (Trái) */}
                             {[1, 2, 3].map(colNum => (
                                <SeatItem 
                                    key={`${rowNum}-${colNum}`}
                                    seat={seatMap.get(`${rowNum}-${colNum}`)} // Tìm ghế theo Row-Col
                                    passengers={passengers}
                                    selectedCustomer={selectedCustomer}
                                    tempSelectedSeat={tempSelectedSeat}
                                    onSeatClick={handleSeatClick}
                                />
                             ))}
                        </div>

                        {/* LỐI ĐI (AISLE) */}
                        <div className="w-8 flex justify-center items-center text-[10px] text-gray-200 font-mono">
                            {rowNum}
                        </div>

                        <div className="flex gap-2">
                             {/* Loop Col 4-6 (Phải) */}
                             {[4, 5, 6].map(colNum => (
                                <SeatItem 
                                    key={`${rowNum}-${colNum}`}
                                    seat={seatMap.get(`${rowNum}-${colNum}`)} 
                                    passengers={passengers}
                                    selectedCustomer={selectedCustomer}
                                    tempSelectedSeat={tempSelectedSeat}
                                    onSeatClick={handleSeatClick}
                                />
                             ))}
                        </div>

                        {/* Số hàng bên phải */}
                        <div className="w-6 text-left text-xs font-bold text-gray-300 group-hover:text-gray-500 transition-colors">
                            {rowNum}
                        </div>
                   </div>
                ))}
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-orange-600">
              <CheckCircle2 className="h-6 w-6" /> Xác nhận ghế
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-gray-700">
              Chọn ghế <span className="font-bold text-black border px-2 py-0.5 rounded bg-gray-100">{tempSelectedSeat?.seatNumber}</span> cho hành khách <span className="font-bold text-blue-600">{selectedCustomer?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          
          {/* Thông tin ghế chi tiết */}
          {tempSelectedSeat && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 border">
                  <div className="flex justify-between">
                      <span className="text-gray-500">Hạng vé:</span>
                      <span className="font-medium">{tempSelectedSeat.seatClass.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-500">Vị trí:</span>
                      <span className="font-medium">{tempSelectedSeat.seatType}</span>
                  </div>
              </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Chọn lại
            </Button>
            <Button onClick={confirmSeatSelection} className="bg-green-600 hover:bg-green-700 text-white">
              Đồng ý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SeatItem({ seat, passengers, selectedCustomer, tempSelectedSeat, onSeatClick }) {
    if (!seat) return <div className="w-10 h-10"></div>;

    // Check trạng thái ghế
    const isSelectedByCurrent = tempSelectedSeat?.seatNumber === seat.seatNumber;
    const isBookedByMyGroup = passengers.some(p => p.seat === seat.seatNumber); // Ghế nhóm mình đã chọn
    const isSeatOfCurrentCustomer = passengers.find(p => p.id === selectedCustomer?.id)?.seat === seat.seatNumber; // Ghế hiện tại của khách đang active

    // Styles cơ bản
    const isBusiness = seat.seatClass.includes("BUSINESS");
    const isAvailable = seat.type === "available";
    const isBlocked = seat.type === "blocked" || (isBookedByMyGroup && !isSeatOfCurrentCustomer); // Block nếu người khác trong nhóm đã chọn

    // Xác định Class màu sắc
    let btnClass = "bg-white border-gray-300 text-gray-400 hover:border-gray-400"; // Mặc định Economy Available
    
    if (isBusiness) {
        btnClass = "bg-white border-purple-300 text-purple-400 hover:border-purple-500 hover:bg-purple-50"; // Mặc định Business
    }

    if (!isAvailable || isBlocked) {
        btnClass = "bg-gray-200 border-transparent text-gray-400 cursor-not-allowed opacity-70"; // Đã bán / Block
    } else if (isSelectedByCurrent) {
        btnClass = "bg-orange-500 border-orange-600 text-white shadow-lg scale-110 z-10"; // Đang chọn tạm
    } else if (isSeatOfCurrentCustomer) {
        btnClass = "bg-blue-600 border-blue-700 text-white shadow-md"; // Ghế đã chốt của khách này
    } else if (selectedCustomer) {
        // Hover state khi đang chọn khách
        btnClass += " cursor-pointer hover:shadow-md hover:scale-105";
    } else {
        btnClass += " cursor-not-allowed opacity-50"; // Chưa chọn khách
    }

    // Icon ghế: Thương gia dùng icon to/khác hơn chút
    const Icon = isBusiness ? MdAirlineSeatReclineExtra : MdChair;

    return (
        <button
            onClick={() => onSeatClick(seat)}
            disabled={!isAvailable || isBlocked || !selectedCustomer}
            className={cn(
                "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 relative group",
                btnClass
            )}
            title={`${seat.seatNumber} - ${seat.seatClass}`}
        >
            <Icon size={isBusiness ? 20 : 24} />
            
            {/* Tooltip hover số ghế */}
            {!isBlocked && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {seat.seatNumber}
                </span>
            )}
        </button>
    )
}

function LegendItem({ color, label, isOutline }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-4 h-4 rounded-sm", color, isOutline && "border-2")}></div>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}