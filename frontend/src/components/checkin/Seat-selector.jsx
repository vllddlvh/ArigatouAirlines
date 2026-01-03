'use client';

import React, { useState, useMemo } from "react";
import { 
  MdChair, 
  MdAirlineSeatReclineExtra, 
  MdAirlineSeatFlat 
} from "react-icons/md"; 
import { 
  User, Info, CheckCircle2, Users, AlertCircle, PlaneTakeoff 
} from 'lucide-react';
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

// --- HELPER FUNCTIONS ---

// 1. Group ghế theo hàng
const groupSeatsByRow = (seats) => {
  const rows = {};
  if (!Array.isArray(seats)) return rows;
  seats.forEach(seat => {
    const rowNum = seat.visualRow;
    if (!rows[rowNum]) rows[rowNum] = [];
    rows[rowNum].push(seat);
  });
  return rows;
};

// 2. Cấu hình giao diện cho 3 hạng ghế
const getSeatConfig = (seatClass) => {
  const upperClass = seatClass ? seatClass.toUpperCase() : "ECONOMY";

  // 1. BUSINESS_PREMIER - Hạng Thương Gia Cao Cấp (Xịn nhất)
  if (upperClass === "BUSINESS_PREMIER") {
    return {
      color: "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100",
      selectedColor: "bg-yellow-500 border-yellow-600 text-white",
      icon: MdAirlineSeatFlat,
      label: "Thương Gia Premier",
      size: "w-12 h-12"
    };
  } 
  
  if (upperClass === "PREMIUM_ECONOMY") {
    return {
      color: "bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100",
      selectedColor: "bg-purple-600 border-purple-700 text-white",
      icon: MdAirlineSeatReclineExtra, 
      label: "Phổ Thông Đặc Biệt",
      size: "w-11 h-11" 
    };
  }

  // 3. ECONOMY - Phổ Thông (Mặc định)
  return {
    color: "bg-white border-blue-200 text-blue-500 hover:bg-blue-50",
    selectedColor: "bg-blue-600 border-blue-700 text-white",
    icon: MdChair,
    label: "Phổ Thông",
    size: "w-10 h-10"  
  };
};

export default function SeatSelector({ seats: initialSeats, passengers, onSeatSelect }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tempSelectedSeat, setTempSelectedSeat] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const seatMap = useMemo(() => {
    const map = new Map();
    initialSeats.forEach(seat => {
      map.set(`${seat.visualRow}-${seat.visualCol}`, seat);
    });
    return map;
  }, [initialSeats]);


  const rowsData = useMemo(() => groupSeatsByRow(initialSeats), [initialSeats]);
  const rowNumbers = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b));

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleSeatClick = (seat) => {
    // Logic check: Phải chọn khách trước & ghế phải available & chưa bị book
    const isBooked = seat.status === "Booked" || seat.type !== "available";
    
    if (!isBooked && selectedCustomer) {
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

        {/* --- LEFT PANEL: LIST PASSENGERS --- */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="shadow-md border-t-4 border-blue-500 bg-white">
            <CardHeader className="p-4 border-b bg-blue-50/30">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Users className="h-5 w-5 text-blue-600" /> Danh Sách Hành Khách
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
                        ? "bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-200"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50",
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

          {/* LEGEND (CHÚ THÍCH) */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-gray-700">
                <Info className="h-4 w-4" /> Chú Giải
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <LegendItem color="bg-blue-500 border-blue-600 text-white" label="Đang chọn" />
                <LegendItem color="bg-gray-300 border-gray-400 text-gray-500" label="Đã bán / Kín" />
                {/* 3 Hạng ghế */}
                <LegendItem color="bg-yellow-100 border-yellow-400 text-yellow-600" label="Hạng Nhất" isOutline />
                <LegendItem color="bg-purple-50 border-purple-300 text-purple-600" label="Thương Gia" isOutline />
                <LegendItem color="bg-white border-blue-200 text-blue-400" label="Phổ Thông" isOutline />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT PANEL: AIRPLANE MAP --- */}
        <div className="flex-1 flex flex-col items-center">
            
          {/* Status Bar */}
          <div className="mb-6 w-full text-center h-16">
             {selectedCustomer ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg animate-in fade-in slide-in-from-top-4">
                <User className="h-5 w-5" /> 
                <span>Đang chọn ghế cho: <strong>{selectedCustomer.fullName}</strong></span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm">
                <AlertCircle className="h-5 w-5" /> 
                <span>Vui lòng chọn hành khách để bắt đầu</span>
              </div>
            )}
          </div>

          {/* MAP CONTAINER */}
          <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 p-8 pb-20 w-full max-w-3xl overflow-visible">
            
            {/* Buồng lái */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-gray-200 to-white rounded-b-full opacity-50 z-0"></div>
            <div className="flex justify-center mb-10 text-gray-300 relative z-10">
                <PlaneTakeoff size={48} />
            </div>

            {/* SEAT GRID */}
            <div className="flex flex-col gap-3 items-center relative z-10">
                
                {/* Labels Cột */}
                <div className="flex gap-4 mb-2">
                    <div className="flex gap-2 w-[140px] justify-center">
                        {['A', 'B', 'C'].map(char => (
                            <div key={char} className="w-10 text-center font-bold text-gray-400">{char}</div>
                        ))}
                    </div>
                    <div className="w-8"></div>
                    <div className="flex gap-2 w-[140px] justify-center">
                        {['D', 'E', 'F'].map(char => (
                            <div key={char} className="w-10 text-center font-bold text-gray-400">{char}</div>
                        ))}
                    </div>
                </div>

                {/* Render Rows */}
                {rowNumbers.map((rowNum) => (
                   <div key={rowNum} className="flex items-center gap-4 group">
                        
                        {/* Số hàng trái */}
                        <div className="w-6 text-right text-xs font-bold text-gray-300">
                            {rowNum}
                        </div>

                        {/* Ghế bên trái (Col 1-3) */}
                        <div className="flex gap-2 w-[140px] justify-end">
                             {[1, 2, 3].map(colNum => (
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

                        {/* Lối đi */}
                        <div className="w-8 flex justify-center items-center text-[10px] text-gray-200 font-mono">
                            {rowNum}
                        </div>

                        {/* Ghế bên phải (Col 4-6) */}
                        <div className="flex gap-2 w-[140px] justify-start">
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

                        {/* Số hàng phải */}
                        <div className="w-6 text-left text-xs font-bold text-gray-300">
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
            <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
              <CheckCircle2 className="h-6 w-6" /> Xác nhận ghế
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-gray-700">
              Chọn ghế <span className="font-bold text-black border px-2 py-0.5 rounded bg-gray-100">{tempSelectedSeat?.seatNumber}</span> cho hành khách <span className="font-bold text-blue-600">{selectedCustomer?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          
          {tempSelectedSeat && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border">
                  <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Hạng vé:</span>
                      <span className="font-bold text-gray-900">{getSeatConfig(tempSelectedSeat.seatClass).label}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-500">Vị trí:</span>
                      <span className="font-medium text-gray-900">{tempSelectedSeat.seatType}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className="font-medium text-green-600">Có sẵn</span>
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



function LegendItem({ color, label, isOutline }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex items-center justify-center w-6 h-6 rounded-md shadow-sm", color, isOutline && "border-2")}>
        {isOutline && <MdChair className="w-4 h-4" />}
      </div>
      <span className="text-gray-600 font-medium">{label}</span>
    </div>
  );
}

function SeatItem({ seat, passengers, selectedCustomer, tempSelectedSeat, onSeatClick }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!seat) return <div className="w-10 h-10"></div>;


    const getSeatConfig = (seatClass) => {
        const upperClass = seatClass ? seatClass.toUpperCase() : "";

        if (upperClass === "BUSINESS_PREMIER") {
            return { 
                color: "bg-yellow-100 border-yellow-400 text-yellow-600", 
                icon: MdAirlineSeatFlat, 
                label: "Thương Gia Premier" 
            };
        }

 
        if (upperClass === "PREMIUM_ECONOMY") {
            return { 
                color: "bg-purple-50 border-purple-300 text-purple-600", 
                icon: MdAirlineSeatReclineExtra, 
                label: "Phổ Thông ĐB" 
            };
        }

        return { 
            color: "bg-white border-blue-200 text-blue-400", 
            icon: MdChair, 
            label: "Phổ Thông" 
        };
    };

    const config = getSeatConfig(seat.seatClass);
    const Icon = config.icon;
    const isTempSelected = tempSelectedSeat?.seatNumber === seat.seatNumber;
    const isBookedByMyGroup = passengers.some(p => p.seat === seat.seatNumber);
    const isSeatOfCurrentCustomer = passengers.find(p => p.id === selectedCustomer?.id)?.seat === seat.seatNumber;
    const isApiBooked = seat.status === "Booked" || seat.type !== "available";
    const isBlocked = isApiBooked || (isBookedByMyGroup && !isSeatOfCurrentCustomer);

    // --- Logic Class cho Button (Giữ nguyên Tailwind cho đẹp) ---
    let btnClass = `flex items-center justify-center rounded-lg border-2 w-10 h-10 transition-all `;
    let iconClass = "";

    if (isBlocked) {
        btnClass += "bg-gray-200 border-gray-200 cursor-not-allowed opacity-60";
        iconClass = "text-gray-400";
    } else if (isTempSelected) {
        btnClass += "bg-orange-500 border-orange-600 shadow-lg scale-110"; 
        iconClass = "text-white";
    } else if (isSeatOfCurrentCustomer) {
        btnClass += "bg-blue-600 border-blue-700 text-white shadow-md";
        iconClass = "text-white";
    } else {
        btnClass += config.color;
        if (selectedCustomer) btnClass += " cursor-pointer hover:shadow-md hover:scale-105";
        else btnClass += " cursor-not-allowed opacity-80";
    }

    return (
        <div 
            className="relative flex justify-center items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ zIndex: isHovered ? 9999 : 'auto' }} 
        >
            <button
                onClick={() => onSeatClick(seat)}
                disabled={isBlocked || !selectedCustomer}
                className={btnClass}
            >
                <Icon size={20} className={iconClass} />
                {!isBlocked && (
                    <span className="absolute bottom-0.5 right-1 text-[8px] font-bold opacity-60 pointer-events-none">
                        {seat.seatNumber.replace(/[0-9]/g, '')}
                    </span>
                )}
            </button>

            {isHovered && (
                <div 
                    style={{
                        position: 'absolute',
                        bottom: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#1f2937',
                        color: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                        width: 'max-content',
                        minWidth: '140px',
                        zIndex: 10000,
                        pointerEvents: 'none',
                        textAlign: 'left'
                    }}
                >

                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: '#1f2937 transparent transparent transparent'
                    }}></div>

                    {/* Nội dung Tooltip */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fbbf24' }}>{seat.seatNumber}</span>
                            <span style={{ fontSize: '10px', background: '#374151', padding: '2px 6px', borderRadius: '4px', border: '1px solid #4b5563' }}>
                                {config.label}
                            </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', fontSize: '12px' }}>
                            <span style={{ color: '#9ca3af' }}>Loại:</span>
                            <span style={{ fontWeight: '500' }}>
                                {seat.seatType === 'WINDOW' ? 'Cửa sổ' : seat.seatType === 'AISLE' ? 'Lối đi' : 'Giữa'}
                            </span>

                            <span style={{ color: '#9ca3af' }}>Trạng thái:</span>
                            <span style={{ fontWeight: 'bold', color: isApiBooked ? '#f87171' : '#4ade80' }}>
                                {isApiBooked ? 'Đã đặt' : 'Trống'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}