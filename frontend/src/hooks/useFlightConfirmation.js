import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { format, parse } from "date-fns";
import { useAccountInfo } from "@/hooks/useAccountInfo";
import { toast } from "@/hooks/use-toast";

/** Khai báo constant để ngoài cùng, đảm bảo không thay đổi reference */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Hàm tiện ích tách ra ngoài để không bị re-create mỗi lần render.
 * Không phụ thuộc state/props => có thể định nghĩa ngoài hook
 */
function generateTicketOptions(basePrice, type) {
  const changeFee = type === "economy" ? 860000 : 360000;
  const refundFee = type === "economy" ? 860000 : 360000;
  const checkedBaggage = type === "economy" ? "1 x 23 kg" : "2 x 32 kg";
  const carryOn = "Không quá 12kg";
  return [
    {
      id: `${type}1`,
      name: type === "economy" ? "Phổ Thông Tiêu Chuẩn" : "Thương Gia Tiêu Chuẩn",
      price: basePrice,
      changeFee,
      refundFee,
      checkedBaggage,
      carryOn,
    },
    {
      id: `${type}2`,
      name: type === "economy" ? "Phổ Thông Linh Hoạt" : "Thương Gia Linh Hoạt",
      price: basePrice + 500000,
      changeFee: changeFee / 2,
      refundFee: refundFee / 2,
      checkedBaggage,
      carryOn,
    },
  ];
}

export function useFlightConfirmation() {
  const router = useRouter();
  const {
    departureFlightId,
    departureOptionId,
    returnFlightId,
    returnOptionId,
    passengerCount,
  } = router.query;

  const tripType = returnFlightId && returnOptionId ? "roundTrip" : "oneWay";

  const [departureFlightData, setDepartureFlightData] = useState(null);
  const [returnFlightData, setReturnFlightData] = useState(null);
  const [departureOption, setDepartureOption] = useState(null);
  const [returnOption, setReturnOption] = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [isPassengerInfoFilled, setIsPassengerInfoFilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPassengerInfoOpen, setIsPassengerInfoOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const { personalInfo, loading: accountLoading } = useAccountInfo();

  // Mock data for departure flight
  const mockDepartureData = {
    flightId: "dep-flight-1",
    flightNumber: "VN123",
    departureTime: { seconds: Math.floor(Date.now() / 1000) + 3600 }, // 1 hour from now
    arrivalTime: { seconds: Math.floor(Date.now() / 1000) + 7200 }, // 2 hours from now
    departureCity: "Hà Nội",
    arrivalCity: "TP. Hồ Chí Minh",
    basePrice: 2000000, // VND
  };

  // Mock data for return flight
  const mockReturnData = {
    flightId: "ret-flight-1",
    flightNumber: "VN456",
    departureTime: { seconds: Math.floor(Date.now() / 1000) + 86400 + 3600 }, // Next day + 1 hour
    arrivalTime: { seconds: Math.floor(Date.now() / 1000) + 86400 + 7200 }, // Next day + 2 hours
    departureCity: "TP. Hồ Chí Minh",
    arrivalCity: "Hà Nội",
    basePrice: 2100000, // VND
  };

  /**
   * useEffect: set mock data when query params are present.
   */
  useEffect(() => {
    if (!departureFlightId || !departureOptionId) return;

    setLoading(true);

    // Set departure flight data
    const economyOptionsDeparture = generateTicketOptions(mockDepartureData.basePrice, "economy");
    const businessOptionsDeparture = generateTicketOptions(mockDepartureData.basePrice * 1.5, "business");
    const allOptionsDeparture = [...economyOptionsDeparture, ...businessOptionsDeparture];
    const departureOption = allOptionsDeparture.find((opt) => opt.id === departureOptionId) || allOptionsDeparture[0];

    setDepartureFlightData(mockDepartureData);
    setDepartureOption(departureOption);

    // Set return flight data if round trip
    if (returnFlightId && returnOptionId) {
      const economyOptionsReturn = generateTicketOptions(mockReturnData.basePrice, "economy");
      const businessOptionsReturn = generateTicketOptions(mockReturnData.basePrice * 1.5, "business");
      const allOptionsReturn = [...economyOptionsReturn, ...businessOptionsReturn];
      const returnOption = allOptionsReturn.find((opt) => opt.id === returnOptionId) || allOptionsReturn[0];

      setReturnFlightData(mockReturnData);
      setReturnOption(returnOption);
    }

    setLoading(false);
  }, [
    departureFlightId,
    departureOptionId,
    returnFlightId,
    returnOptionId,
  ]);

  const totalAmount =
    (departureOption?.price + (returnOption?.price || 0)) *
    parseInt(passengerCount || 1, 10);

  const handlePassengerInfoFilled = () => {
    setIsPassengerInfoFilled(true);
  };

  const handleConfirmPayment = () => {
    setIsPaymentConfirmed(true);
    if (!isPassengerInfoFilled) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng nhập thông tin hành khách trước khi thanh toán.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thanh toán thành công",
      description: "Cảm ơn quý khách đã đặt vé. Chúc quý khách có chuyến bay vui vẻ!",
    });
  };

  const handleReturnHome = () => {
    router.push("/");
  };

  const handleOpenPassengerInfo = () => {
    setIsPassengerInfoOpen(true);
  };

  const handleSavePassengerInfo = async (passengerData) => {
    // Mock booking creation - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Generate mock booking ID
    const mockBookingId = `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setBookingId(mockBookingId);

    toast({
      title: "Đặt vé thành công",
      description: `Mã đặt vé của bạn là: ${mockBookingId}`,
      variant: "success",
    });
  };

  return {
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
    passengerCount,
    handlePassengerInfoFilled,
    handleConfirmPayment,
    handleReturnHome,
    handleOpenPassengerInfo,
    handleSavePassengerInfo,
    setIsPaymentConfirmed,
    setIsPassengerInfoOpen,
  };
}
