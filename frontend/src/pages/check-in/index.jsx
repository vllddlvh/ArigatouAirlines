"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/router"; 
import { format } from "date-fns";

// --- UI COMPONENTS ---
import { StepIndicator } from "@/components/checkin/step-indicator";
import { FlightDetailsStep } from "@/components/checkin/flight-details";
import { PassengerInputStep } from "@/components/checkin/passenger-input-step"; 
import { SeatSelectionStep } from "@/components/checkin/seat-selection";
import LoadingSkeleton from "@/components/checkin/loading-skeleton"; 

// --- HOOK ---
import { useFlightConfirmation } from "@/hooks/useFlightConfirmation";

// 1. CẬP NHẬT: Chỉ giữ lại 3 bước
const steps = [
  { title: "Chuyến bay", description: "Chi tiết" },
  { title: "Hành khách", description: "Điền thông tin" },
  { title: "Chọn ghế", description: "Vị trí ngồi" },
];

export default function CheckInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // --- LẤY LOGIC TỪ HOOK ---
  const {
    tripType,
    departureFlightData,
    returnFlightData,
    totalAmount,
    
    // Data Ghế & Khách
    flightSeats,
    passengers, 
    selectedAssignments, 
    loading,
    error,
    isCreatingBooking, // Trạng thái loading khi gọi API tạo booking

    handleSavePassengerInfo, 
    toggleSeatSelection,     
    handleConfirmPayment, // Hàm này trong hook đã có logic redirect sang /payment
  } = useFlightConfirmation();

  // --- XỬ LÝ QUERY PARAMS ---
  const passengerCounts = useMemo(() => {
    const query = router.query || {};
    return query.passengerCount;
  }, [router.query]);

  const totalPassengers = passengerCounts;

  // --- DATA ADAPTER ---
  const formatTime = (seconds) => seconds ? format(new Date(seconds * 1000), "HH:mm") : "--:--";
  const formatDate = (seconds) => seconds ? format(new Date(seconds * 1000), "dd/MM/yyyy") : "--/--/----";
  const formatDuration = (mins) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "";

  const departureFlightProps = departureFlightData ? {
    from: departureFlightData.departureCity,
    to: departureFlightData.arrivalCity,
    departureTime: formatTime(departureFlightData.departureTime?.seconds),
    arrivalTime: formatTime(departureFlightData.arrivalTime?.seconds),
    duration: formatDuration(departureFlightData.durationMinutes),
    flightNumber: departureFlightData.flightNumber,
    date: formatDate(departureFlightData.departureTime?.seconds),
    basePrice: departureFlightData.basePrice
  } : null;

  const returnFlightProps = returnFlightData ? {
    from: returnFlightData.departureCity,
    to: returnFlightData.arrivalCity,
    departureTime: formatTime(returnFlightData.departureTime?.seconds),
    arrivalTime: formatTime(returnFlightData.arrivalTime?.seconds),
    duration: formatDuration(returnFlightData.durationMinutes),
    flightNumber: returnFlightData.flightNumber,
    date: formatDate(returnFlightData.departureTime?.seconds),
  } : null;

  const mappedSeats = Array.isArray(flightSeats) ? flightSeats.map(seat => {
    const isSelected = Object.values(selectedAssignments).includes(seat.seatNumber);
    let type = 'available';
    if (seat.booked) type = 'blocked';
    if (isSelected) type = 'selected';
    return { ...seat, type };
  }) : [];

  // --- ACTION HANDLERS ---

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else router.back();
  };

  const onPassengerSubmit = (data) => {
    handleSavePassengerInfo(data.passengers); 
    handleNext();
  };

  // 2. CẬP NHẬT: Xử lý khi chọn ghế xong -> Gọi API tạo booking & Redirect
  const onSeatSubmit = async () => {
    const selectedCount = Object.keys(selectedAssignments).length;

    if (selectedCount !== Number(totalPassengers)) {
        alert(`Vui lòng chọn đủ ${totalPassengers} ghế.`);
        return;
    }

    // Gọi hàm trong hook: Tạo booking -> Redirect sang /payment
    await handleConfirmPayment(); 
  };

  // --- RENDER ---

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="p-10 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Step Indicator */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto py-4">
           <StepIndicator currentStep={currentStep} steps={steps} />
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 mt-4">
        
        {/* STEP 0: CHI TIẾT CHUYẾN BAY */}
        {currentStep === 0 && (
          <FlightDetailsStep
            flightDetails={departureFlightProps}
            returnFlightDetails={tripType === "roundTrip" ? returnFlightProps : null}
            passengerCount={totalPassengers}
            totalPrice={totalAmount}
            onContinue={handleNext}
            onCancel={handleBack}
          />
        )}

        {/* STEP 1: NHẬP THÔNG TIN HÀNH KHÁCH */}
        {currentStep === 1 && (
          <PassengerInputStep
            passengerCounts={passengerCounts} 
            onContinue={onPassengerSubmit}
            onBack={handleBack}
          />
        )}

        {/* STEP 2: CHỌN GHẾ */}
        {currentStep === 2 && (
          <SeatSelectionStep
            passengers={passengers} 
            seats={mappedSeats}
            onSeatSelect={toggleSeatSelection} 
            
            // Thay đổi hành động nút Continue: Gọi API và Redirect
            onContinue={onSeatSubmit}
            onBack={handleBack}
            currentTrip={"departure"}
          />
        )}


        {isCreatingBooking && (
            <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-lg font-medium">Đang khởi tạo đặt chỗ...</p>
            </div>
        )}

      </div>
    </div>
  );
}