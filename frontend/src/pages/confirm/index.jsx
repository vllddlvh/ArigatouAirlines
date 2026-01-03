import React from "react";
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, Plane, CreditCard, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PassengerInfoDialog } from "@/components/PassengerInfoDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlightConfirmation } from "@/hooks/useFlightConfirmation";

export default function ConfirmationPage() {
  const {
    tripType,
    departureFlightData,
    returnFlightData,
    departureOption,
    returnOption,
    isPaymentConfirmed,
    isPassengerInfoFilled,
    loading,
    error,
    isPassengerInfoOpen,
    bookingId,
    totalAmount,
    isCreatingBooking,
    passengerCount,
    flightSeats,
    selectedSeatIds,
    isSeatSelectionOpen,
    setIsSeatSelectionOpen,
    toggleSeatSelection,
    confirmSeatSelection,
    aircraftNumCols,
    allowedSeatClass,
    handlePassengerInfoFilled,
    handleConfirmPayment,
    handleReturnHome,
    handleOpenPassengerInfo,
    handleSavePassengerInfo,
    setIsPaymentConfirmed,
    setIsPassengerInfoOpen,
  } = useFlightConfirmation();

  const expectedSeatCount = parseInt(passengerCount || 1, 10);
  const areSeatsSelected = Array.isArray(selectedSeatIds) && selectedSeatIds.length === expectedSeatCount;

  const formatTime = (seconds) => {
    return new Date(seconds * 1000).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateFlightDuration = (departureTime, arrivalTime) => {
    const durationInMinutes = (arrivalTime - departureTime) / 60;
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.floor(durationInMinutes % 60);
    return `${hours} giờ ${minutes} phút`;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <FlightDetails
        tripType={tripType}
        departureFlightData={departureFlightData}
        returnFlightData={returnFlightData}
        departureOption={departureOption}
        returnOption={returnOption}
        formatTime={formatTime}
        calculateFlightDuration={calculateFlightDuration}
        passengerCount={passengerCount}
      />
      <SeatSelectionSection
        passengerCount={expectedSeatCount}
        flightSeats={flightSeats}
        selectedSeatIds={selectedSeatIds}
        areSeatsSelected={areSeatsSelected}
        isSeatSelectionOpen={isSeatSelectionOpen}
        setIsSeatSelectionOpen={setIsSeatSelectionOpen}
        toggleSeatSelection={toggleSeatSelection}
        confirmSeatSelection={confirmSeatSelection}
        numCols={aircraftNumCols}
        allowedSeatClass={allowedSeatClass}
        totalSeats={departureFlightData?.aircraft?.aircraftType?.totalSeats}
      />
      <TotalAndActions
        totalAmount={totalAmount}
        isCreatingBooking={isCreatingBooking}
        areSeatsSelected={areSeatsSelected}
        isPassengerInfoFilled={isPassengerInfoFilled}
        handleOpenPassengerInfo={handleOpenPassengerInfo}
        handleConfirmPayment={handleConfirmPayment}
      />
      <ConfirmationDialog
        isOpen={isPaymentConfirmed}
        onOpenChange={setIsPaymentConfirmed}
        bookingId={bookingId}
        handleReturnHome={handleReturnHome}
      />
      <PassengerInfoDialog
        isOpen={isPassengerInfoOpen}
        onClose={() => setIsPassengerInfoOpen(false)}
        passengerCount={parseInt(passengerCount) || 1}
        onInfoFilled={(info) => {
          handlePassengerInfoFilled();
          handleSavePassengerInfo(info);
          setIsPassengerInfoOpen(false);
        }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="h-[200px] w-full bg-orange relative mb-4">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-orange">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <Skeleton className="h-6 w-1/3 mb-2 sm:mb-0" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Skeleton className="h-8 w-16" />
                <div className="flex-1 relative px-8">
                  <Skeleton className="h-6 w-6 mx-auto" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div className="mb-2 sm:mb-0">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-48 rounded" />
                <Skeleton className="h-10 w-48 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="relative h-[200px] w-full bg-orange">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lựa chọn của quý hành khách</h1>
      </div>
    </div>
  );
}

function FlightDetails({ tripType, departureFlightData, returnFlightData, departureOption, returnOption, formatTime, calculateFlightDuration, passengerCount }) {
  const flightCards = [
    { flightData: departureFlightData, option: departureOption, title: "Chi tiết chuyến bay đi" },
    ...(tripType === "roundTrip" ? [{ flightData: returnFlightData, option: returnOption, title: "Chi tiết chuyến bay về" }] : []),
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 m-4 relative z-10">
      {flightCards.map((card, index) => (
        <FlightCard
          key={index}
          {...card}
          formatTime={formatTime}
          calculateFlightDuration={calculateFlightDuration}
          passengerCount={passengerCount}
        />
      ))}
    </div>
  );
}

function FlightCard({ flightData, option, title, formatTime, calculateFlightDuration, passengerCount }) {
  return (
    <Card className="shadow-lg border-orange mb-4">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h2>
          <span className="text-sm text-gray-500">{flightData.flightNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                {formatTime(flightData.departureTime.seconds)}
              </span>
              <span className="text-base sm:text-lg font-medium text-gray-600">
                {flightData.departureCity}
              </span>
            </div>
            <div className="flex-1 relative px-8">
              <Plane className="text-orange absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-45" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                {formatTime(flightData.arrivalTime.seconds)}
              </span>
              <span className="text-base sm:text-lg font-medium text-gray-600">
                {flightData.arrivalCity}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-500">{option.name}</div>
            <div className="text-xl sm:text-2xl font-bold text-orange">{option.price.toLocaleString()} VND</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="text-orange flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-500">Ngày khởi hành</div>
              <div className="font-medium">
                {new Date(flightData.departureTime.seconds * 1000).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="text-orange flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-500">Thời gian bay</div>
              <div className="font-medium">
                {calculateFlightDuration(flightData.departureTime.seconds, flightData.arrivalTime.seconds)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="text-orange flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-500">Hành khách</div>
              <div className="font-medium">{passengerCount} Người lớn/ Trẻ em</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="text-orange flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-500">Phương thức thanh toán</div>
              <div className="font-medium">Thẻ tín dụng</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalAndActions({
  totalAmount,
  isCreatingBooking,
  areSeatsSelected,
  isPassengerInfoFilled,
  handleOpenPassengerInfo,
  handleConfirmPayment,
}) {
  return (
    <div className="border-t border-gray-200 pt-6 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div className="mb-2 sm:mb-0">
            <div className="text-lg font-semibold text-gray-800">Tổng cộng</div>
            <div className="text-sm text-gray-500">Đã bao gồm thuế và phí</div>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-orange">
              {Number(totalAmount || 0).toLocaleString()} VND
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleOpenPassengerInfo}
            disabled={!areSeatsSelected || isCreatingBooking}
          >
            Nhập thông tin hành khách
          </Button>
          <Button
            variant="orange"
            className={`w-full sm:w-auto text-white ${(!isPassengerInfoFilled || isCreatingBooking) && "opacity-50 cursor-not-allowed"}`}
            onClick={handleConfirmPayment}
            disabled={!areSeatsSelected || !isPassengerInfoFilled || isCreatingBooking}
          >
            {isCreatingBooking ? "Đang đặt vé..." : "Xác nhận và thanh toán"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SeatSelectionSection({
  passengerCount,
  flightSeats,
  selectedSeatIds,
  areSeatsSelected,
  isSeatSelectionOpen,
  setIsSeatSelectionOpen,
  toggleSeatSelection,
  confirmSeatSelection,
  numCols = 6,
  allowedSeatClass = "ECONOMY",
  totalSeats = 0,
}) {
  const seats = Array.isArray(flightSeats) ? flightSeats : [];
  const selectedIds = Array.isArray(selectedSeatIds) ? selectedSeatIds : [];
  const selectedSeatNumbers = selectedIds
    .map((id) => seats.find((s) => s?.flightSeatId === id)?.seatNumber)
    .filter(Boolean);

  // Build seat map by [visualRow][visualCol]
  const seatByRowCol = seats.reduce((acc, s) => {
    if (!s.visualRow || !s.visualCol) return acc;
    acc[s.visualRow] = acc[s.visualRow] || {};
    acc[s.visualRow][s.visualCol] = s;
    return acc;
  }, {});

  // Calculate total rows from aircraft structure
  const totalRows = totalSeats > 0 && numCols > 0 
    ? Math.ceil(totalSeats / numCols)
    : Math.max(...seats.map(s => s.visualRow || 0), 0);
  
  // Generate row and column arrays based on aircraft structure
  const rowKeys = totalRows > 0 
    ? Array.from({ length: totalRows }, (_, i) => i + 1)
    : Array.from(new Set(seats.map((s) => s.visualRow))).filter(Boolean).sort((a, b) => a - b);
  
  const colKeys = numCols > 0
    ? Array.from({ length: numCols }, (_, i) => i + 1)
    : Array.from(new Set(seats.map((s) => s.visualCol))).filter(Boolean).sort((a, b) => a - b);

  // Calculate split for aisle: for 6 cols split at 3 (A,B,C | D,E,F), for 4 cols split at 2 (A,B | C,D)
  const actualNumCols = colKeys.length || numCols;
  const splitIndex = Math.ceil(actualNumCols / 2);
  const leftCols = colKeys.slice(0, splitIndex);
  const rightCols = colKeys.slice(splitIndex);

  // Seat class colors
  const seatClassColors = {
    BUSINESS_PREMIER: { available: "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300", label: "Business" },
    PREMIUM_ECONOMY: { available: "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300", label: "Premium" },
    ECONOMY: { available: "bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300", label: "Phổ thông" },
  };

  const allowedLabel = seatClassColors[allowedSeatClass]?.label || "Phổ thông";

  const renderSeatCell = (r, c) => {
    const seat = seatByRowCol?.[r]?.[c];
    
    // If no seat data, render empty placeholder
    if (!seat) {
      const seatNumber = `${r}${String.fromCharCode(64 + c)}`;
      return (
        <div 
          key={`${r}-${c}`} 
          className="h-10 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400"
          title="Ghế chưa có dữ liệu"
        >
          {seatNumber}
        </div>
      );
    }

    const seatId = seat.flightSeatId;
    const isSelected = selectedIds.includes(seatId);
    const isAvailable = String(seat.status || "").toUpperCase() === "AVAILABLE";
    const seatClassKey = seat.seatClass || "ECONOMY";
    const matchesClass = seatClassKey === allowedSeatClass;
    const disabled = (!isAvailable && !isSelected) || (!matchesClass && !isSelected);

    const baseClass =
      "h-10 rounded-lg border text-sm font-semibold transition-colors flex items-center justify-center";
    
    const classColor = seatClassColors[seatClassKey]?.available || seatClassColors.ECONOMY.available;
    
    const stateClass = isSelected
      ? "bg-blue-600 text-white border-blue-700"
      : !matchesClass
        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
        : isAvailable
          ? classColor
          : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed";

    return (
      <button
        key={seatId}
        disabled={disabled}
        onClick={() => toggleSeatSelection(seatId)}
        className={`${baseClass} ${stateClass}`}
        title={`${seat.seatNumber} - ${seatClassColors[seatClassKey]?.label || "Phổ thông"}${seatClassKey !== allowedSeatClass ? " (không đúng hạng vé)" : ""} - ${seat.seatType || ""}`}
      >
        {seat.seatNumber || `#${seatId}`}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="shadow-lg border-orange mb-4">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-800">Chọn ghế</div>
              <div className="text-sm text-gray-500">
                Đã chọn {selectedIds.length}/{passengerCount} ghế
              </div>
              {selectedSeatNumbers.length > 0 ? (
                <div className="text-sm text-gray-700 mt-1">
                  {selectedSeatNumbers.join(", ")}
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSeatSelectionOpen(true)}
            >
              {areSeatsSelected ? "Đổi ghế" : "Chọn ghế"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSeatSelectionOpen} onOpenChange={setIsSeatSelectionOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Chọn ghế ({selectedIds.length}/{passengerCount})</DialogTitle>
            <DialogDescription>
              Vui lòng chọn đủ số ghế tương ứng với số hành khách.
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-gray-600">
            Chỉ được chọn ghế hạng: <span className="font-semibold">{allowedLabel}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
              Business
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              Premium
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
              Phổ thông
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-600 border border-blue-700" />
              Đang chọn
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
              Đã đặt
            </div>
          </div>
          <div className="overflow-auto max-h-[60vh]">
            <div className="min-w-[720px] mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-4 sm:p-6">
                {rowKeys.length === 0 ? (
                  <div className="text-sm text-gray-600">Không có dữ liệu ghế cho chuyến bay này.</div>
                ) : (
                  <div className="grid gap-3">
                    {rowKeys.map((r) => (
                      <div
                        key={r}
                        className="grid gap-2 items-center"
                        style={{
                          gridTemplateColumns: `56px repeat(${leftCols.length}, minmax(0, 1fr)) 36px repeat(${rightCols.length}, minmax(0, 1fr))`,
                        }}
                      >
                        <div className="text-sm text-gray-500 flex items-center justify-end pr-2">{r}</div>
                        {leftCols.map((c) => renderSeatCell(r, c))}
                        <div />
                        {rightCols.map((c) => renderSeatCell(r, c))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSeatSelectionOpen(false)}>
              Đóng
            </Button>
            <Button variant="orange" className="text-white" onClick={confirmSeatSelection}>
              Xác nhận ghế
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConfirmationDialog({ isOpen, onOpenChange, bookingId, handleReturnHome }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-center">Thanh toán thành công</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 text-center">
          <DialogDescription className="text-lg">
            Mã đặt vé của bạn là:
          </DialogDescription>
          <div className="px-4 py-2 text-xl font-mono font-bold bg-gray-100 rounded-md">
            {bookingId}
          </div>
          <DialogDescription className="text-base">
            Cảm ơn quý khách đã đặt vé. Chúc quý khách có chuyến bay vui vẻ!
          </DialogDescription>
        </div>
        <Button
          onClick={handleReturnHome}
          variant="orange"
          className="w-full mt-6 text-white transition-colors duration-200"
        >
          Quay về trang chủ
        </Button>
      </DialogContent>
    </Dialog>
  );
}

