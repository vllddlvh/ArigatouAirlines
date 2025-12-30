import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format, parse } from "date-fns";
import { useAccountInfo } from "@/hooks/useAccountInfo";
import { toast } from "@/hooks/use-toast";
import { createBooking } from "@/services/bookingService";
import * as masterDataService from "@/services/masterDataService";

export function useFlightConfirmation() {
  const router = useRouter();
  const {
    departureFlightId,
    departureOptionId,
    returnFlightId,
    returnOptionId,
    passengerCount,
    ticketClassName,
  } = router.query;

  const normalizedTicketClassName = Array.isArray(ticketClassName)
    ? ticketClassName[0]
    : ticketClassName;

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

  const [passengersRaw, setPassengersRaw] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const [flightSeats, setFlightSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [isSeatSelectionOpen, setIsSeatSelectionOpen] = useState(false);
  const [aircraftNumCols, setAircraftNumCols] = useState(6);
  const [allowedSeatClass, setAllowedSeatClass] = useState("ECONOMY");

  const { personalInfo, loading: accountLoading } = useAccountInfo();

  /**
   * useEffect: set mock data when query params are present.
   */
  useEffect(() => {
    if (!departureFlightId) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        setSelectedSeatIds([]);
        const flight = await masterDataService.getFlightById(departureFlightId);
        const seats = Array.isArray(flight?.flightSeatList) ? flight.flightSeatList : [];
        setFlightSeats(seats);

        const numColsFromAircraft = flight?.aircraft?.aircraftType?.numCols;
        if (Number(numColsFromAircraft) > 0) {
          setAircraftNumCols(Number(numColsFromAircraft));
        } else {
          const uniqueVisualCols = new Set();
          seats.forEach((s) => {
            if (s?.visualCol) uniqueVisualCols.add(s.visualCol);
          });
          setAircraftNumCols(uniqueVisualCols.size || 6);
        }

        let flightPrice = null;
        const requested = String(normalizedTicketClassName || "ECONOMY").toUpperCase();
        const isClassMatch = (requestedName, actualName) => {
          const req = String(requestedName || "").toUpperCase();
          const act = String(actualName || "").toUpperCase();
          if (!req) return true;
          if (req === "PREMIUM_ECONOMY" || req === "PREMIUM") {
            return act === "PREMIUM_ECONOMY" || act === "PREMIUM";
          }
          if (req === "BUSINESS" || req === "BUSINESS_CLASS" || req === "BUSINESS_PREMIER") {
            return act === "BUSINESS" || act === "BUSINESS_CLASS" || act === "BUSINESS_PREMIER";
          }
          return act === req;
        };

        const pickFromAllPrices = (allPrices, requestedName) => {
          const req = String(requestedName || "ECONOMY").toUpperCase();
          const list = Array.isArray(allPrices) ? allPrices : [];
          return list.find((p) => isClassMatch(req, p?.ticketClass?.className)) || null;
        };

        const computeFromEconomy = (allPrices, requestedName) => {
          const req = String(requestedName || "ECONOMY").toUpperCase();
          const econ = pickFromAllPrices(allPrices, "ECONOMY");
          const econBase = Number(econ?.basePrice ?? 0);
          const econTax = Number(econ?.tax ?? 0);
          const econTotal = econBase + econTax;
          if (!(econTotal > 0)) return null;

          const multiplier = (req === "BUSINESS" || req === "BUSINESS_CLASS" || req === "BUSINESS_PREMIER")
            ? 2
            : (req === "PREMIUM_ECONOMY" || req === "PREMIUM")
              ? 1.5
              : 1;
          if (multiplier === 1) return null;
          return {
            basePrice: Math.round(econBase * multiplier),
            tax: Math.round(econTax * multiplier),
            ticketClass: { className: req },
          };
        };

        try {
          flightPrice = await masterDataService.getFlightPriceById(departureFlightId, normalizedTicketClassName);
        } catch (e) {
          flightPrice = null;
        }

        const actualClassName = String(flightPrice?.ticketClass?.className || "").toUpperCase();
        const hasMismatch = requested && flightPrice && !isClassMatch(requested, actualClassName);
        const hasZeroPrice = flightPrice && (Number(flightPrice?.basePrice ?? 0) + Number(flightPrice?.tax ?? 0)) <= 0;
        if (!flightPrice || hasMismatch || hasZeroPrice) {
          try {
            const allPrices = await masterDataService.getFlightPricesByFlightId(departureFlightId);
            const picked = pickFromAllPrices(allPrices, requested);
            flightPrice = picked || computeFromEconomy(allPrices, requested) || flightPrice;
          } catch (e2) {
            flightPrice = flightPrice;
          }
        }

        const ticketClass = String(flightPrice?.ticketClass?.className || normalizedTicketClassName || "ECONOMY").toUpperCase();
        if (ticketClass === "BUSINESS" || ticketClass === "BUSINESS_CLASS" || ticketClass === "BUSINESS_PREMIER") {
          setAllowedSeatClass("BUSINESS_PREMIER");
        } else if (ticketClass === "PREMIUM" || ticketClass === "PREMIUM_ECONOMY") {
          setAllowedSeatClass("PREMIUM_ECONOMY");
        } else {
          setAllowedSeatClass("ECONOMY");
        }

        // Không cần validation strict - backend đã tự backfill đủ 3 hạng vé

        const depDt = flight?.departureDateTime ? new Date(flight.departureDateTime) : null;
        const arrDt = flight?.arrivalDateTime ? new Date(flight.arrivalDateTime) : null;

        const depSec = depDt && !Number.isNaN(depDt.getTime()) ? Math.floor(depDt.getTime() / 1000) : Math.floor(Date.now() / 1000);
        const arrSec = arrDt && !Number.isNaN(arrDt.getTime()) ? Math.floor(arrDt.getTime() / 1000) : depSec;

        const departureCity =
          flight?.schedule?.departureAirport?.city || flight?.departureAirportCode || "";
        const arrivalCity =
          flight?.schedule?.arrivalAirport?.city || flight?.arrivalAirportCode || "";

        const base = Number(flightPrice?.basePrice ?? 0);
        const tax = Number(flightPrice?.tax ?? 0);
        let perPassengerAmount = base + tax;
        
        // Nếu giá vẫn là 0 hoặc không khớp hạng, tính theo multiplier từ Economy
        if (perPassengerAmount <= 0 || !isClassMatch(requested, String(flightPrice?.ticketClass?.className || ""))) {
          const econBase = Number(flight?.basePrice ?? 0);
          const econTax = Number(flight?.tax ?? 0);
          const econTotal = econBase + econTax;
          if (econTotal > 0) {
            const multiplier = (requested === "BUSINESS" || requested === "BUSINESS_CLASS" || requested === "BUSINESS_PREMIER")
              ? 2
              : (requested === "PREMIUM_ECONOMY" || requested === "PREMIUM")
                ? 1.5
                : 1;
            perPassengerAmount = Math.round(econTotal * multiplier);
          }
        }
        
        // Log để debug giá
        console.log("Confirm page price calculation:", {
          requestedClass: requested,
          flightPriceClass: flightPrice?.ticketClass?.className,
          basePrice: base,
          tax: tax,
          perPassengerAmount
        });

        setDepartureFlightData({
          flightId: String(flight?.flightId ?? departureFlightId),
          flightNumber: flight?.flightNumber || flight?.schedule?.flightNumber || "",
          departureTime: { seconds: depSec },
          arrivalTime: { seconds: arrSec },
          departureCity,
          arrivalCity,
          basePrice: perPassengerAmount,
        });

        const classNameUpper = String(normalizedTicketClassName || "").toUpperCase();
        const optionName = (classNameUpper === "BUSINESS" || classNameUpper === "BUSINESS_CLASS" || classNameUpper === "BUSINESS_PREMIER")
          ? "Thương gia"
          : (classNameUpper === "PREMIUM_ECONOMY" || classNameUpper === "PREMIUM")
            ? "Premium Economy"
            : "Phổ thông";
        setDepartureOption({
          id: departureOptionId || "default",
          name: optionName,
          price: perPassengerAmount,
        });

        // Backend hiện tại chỉ đặt vé 1 chiều theo flightId, nên không fetch return ở đây.
        setReturnFlightData(null);
        setReturnOption(null);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Không thể tải thông tin chuyến bay";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [
    departureFlightId,
    departureOptionId,
    returnFlightId,
    returnOptionId,
    normalizedTicketClassName,
  ]);

  const totalAmount =
    (departureOption?.price + (returnOption?.price || 0)) *
    parseInt(passengerCount || 1, 10);
  
  // Log để debug tổng tiền
  console.log("Total amount calculation:", {
    departureOptionPrice: departureOption?.price,
    returnOptionPrice: returnOption?.price,
    passengerCount,
    totalAmount
  });

  const handlePassengerInfoFilled = () => {
    setIsPassengerInfoFilled(true);
  };

  const handleConfirmPayment = async () => {
    const token = typeof window === "undefined" ? null : localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để đặt vé.",
        variant: "destructive",
      });
      return;
    }

    const expectedSeatCount = parseInt(passengerCount || 1, 10);
    if (!Array.isArray(selectedSeatIds) || selectedSeatIds.length !== expectedSeatCount) {
      toast({
        title: "Chưa chọn ghế",
        description: `Vui lòng chọn đủ ${expectedSeatCount} ghế trước khi nhập thông tin và thanh toán.`,
        variant: "destructive",
      });
      return;
    }

    if (!isPassengerInfoFilled || !Array.isArray(passengersRaw) || passengersRaw.length === 0) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng nhập thông tin hành khách trước khi thanh toán.",
        variant: "destructive",
      });
      return;
    }

    if (!departureFlightId) {
      toast({
        title: "Thiếu thông tin chuyến bay",
        description: "Không tìm thấy mã chuyến bay để đặt vé.",
        variant: "destructive",
      });
      return;
    }

    const mappedPassengers = passengersRaw.map((p) => {
      const fullName = `${p?.lastName || ""} ${p?.firstName || ""}`.trim();
      const birth = p?.birthDate ? parse(p.birthDate, "dd/MM/yyyy", new Date()) : null;
      const dateOfBirth = birth ? format(birth, "yyyy-MM-dd") : null;
      return {
        fullName,
        dateOfBirth,
        gender: p?.gender,
        nationality: "Vietnam",
      };
    });

    setIsCreatingBooking(true);
    try {
      const payload = {
        flightId: Number(departureFlightId),
        listFlightSeatId: selectedSeatIds,
        listPassengerRequest: mappedPassengers,
        ticketClassName: normalizedTicketClassName ? String(normalizedTicketClassName).toUpperCase() : null,
      };

      const booking = await createBooking(payload);
      const bookingCode = booking?.bookingCode || String(booking?.bookingId || "");
      const bookingId = booking?.bookingId;
      // Dùng totalAmount từ backend response (đã tính đúng theo hạng vé) thay vì tính ở frontend
      const backendTotalAmount = Number(booking?.totalAmount || 0);
      setBookingId(bookingCode);
      
      // Redirect to payment page with booking info
      const flightInfo = {
        flightNumber: departureFlightData?.flightNumber || "",
        route: `${departureFlightData?.departureCity || ""} → ${departureFlightData?.arrivalCity || ""}`,
        date: departureFlightData?.departureTime?.seconds ? new Date(departureFlightData.departureTime.seconds * 1000).toLocaleDateString('vi-VN') : "",
        ticketClass: normalizedTicketClassName || "ECONOMY"
      };

      const baseTotalAmountToPay = backendTotalAmount > 0 ? backendTotalAmount : totalAmount;

      const query = {
        bookingId: bookingId,
        bookingCode: bookingCode,
        totalAmount: baseTotalAmountToPay,
        baseTotalAmount: baseTotalAmountToPay,
        flightInfo: JSON.stringify(flightInfo)
      };
      
      router.push({
        pathname: '/payment',
        query
      });
      
      toast({
        title: "Đặt vé thành công",
        description: "Vui lòng hoàn tất thanh toán.",
      });
    } catch (e) {
      const backendCode = e?.response?.data?.code;
      const backendMsg = e?.response?.data?.message;
      const msg = backendCode === 8010
        ? "Ghế bạn chọn đã hết/không còn trống. Vui lòng chọn ghế khác."
        : backendCode === 8011
          ? "Ghế bạn chọn không đúng hạng vé đang mua. Vui lòng chọn ghế đúng hạng."
          : backendCode === 8012 || backendCode === 9001
            ? "Không đủ ghế trống cho hạng vé này. Vui lòng chọn chuyến khác hoặc đổi hạng vé."
            : (backendMsg || e?.message || "Không thể đặt vé");
      toast({
        title: "Đặt vé thất bại",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleReturnHome = () => {
    router.push("/");
  };

  const handleOpenPassengerInfo = () => {
    setIsPassengerInfoOpen(true);
  };

  const handleSavePassengerInfo = async (passengerData) => {
    setPassengersRaw(passengerData);
  };

  const toggleSeatSelection = (seatId) => {
    const expectedSeatCount = parseInt(passengerCount || 1, 10);
    const normalizedSeatId = Number(seatId);
    if (!normalizedSeatId) return;

    const seat = Array.isArray(flightSeats)
      ? flightSeats.find((s) => Number(s?.flightSeatId) === normalizedSeatId)
      : null;
    const seatClass = seat?.seatClass;

    // Enforce seat class restriction (BUSINESS/PREMIUM/ECONOMY)
    if (!seatClass && allowedSeatClass !== "ECONOMY") {
      toast({
        title: "Không thể chọn ghế",
        description: "Chuyến bay chưa trả về thông tin hạng ghế (seatClass). Vui lòng thử lại sau khi refresh hoặc liên hệ admin.",
        variant: "destructive",
      });
      return;
    }
    if (seatClass && allowedSeatClass && seatClass !== allowedSeatClass) {
      toast({
        title: "Sai hạng ghế",
        description: `Bạn đang mua vé ${allowedSeatClass === "BUSINESS_PREMIER" ? "Thương gia" : allowedSeatClass === "PREMIUM_ECONOMY" ? "Premium" : "Phổ thông"}. Vui lòng chọn ghế đúng hạng.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedSeatIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(normalizedSeatId)) {
        return current.filter((id) => id !== normalizedSeatId);
      }
      if (current.length >= expectedSeatCount) {
        toast({
          title: "Vượt quá số ghế",
          description: `Bạn chỉ được chọn tối đa ${expectedSeatCount} ghế.`,
          variant: "destructive",
        });
        return current;
      }
      return [...current, normalizedSeatId];
    });
  };

  const confirmSeatSelection = () => {
    const expectedSeatCount = parseInt(passengerCount || 1, 10);
    if (!Array.isArray(selectedSeatIds) || selectedSeatIds.length !== expectedSeatCount) {
      toast({
        title: "Chưa đủ ghế",
        description: `Vui lòng chọn đủ ${expectedSeatCount} ghế để tiếp tục.`,
        variant: "destructive",
      });
      return;
    }

    // Defensive check: all selected seats must match allowedSeatClass
    const selectedSeats = (Array.isArray(flightSeats) ? flightSeats : []).filter((s) =>
      selectedSeatIds.includes(Number(s?.flightSeatId))
    );
    const mismatch = selectedSeats.some((s) => s?.seatClass && s.seatClass !== allowedSeatClass);
    if (mismatch) {
      toast({
        title: "Sai hạng ghế",
        description: "Có ghế bạn chọn không đúng hạng vé đang mua. Vui lòng chọn lại.",
        variant: "destructive",
      });
      return;
    }
    setIsSeatSelectionOpen(false);
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
  };
}
