import { useState, useEffect, useMemo } from "react";
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

  // --- STATE DATA ---
  const [departureFlightData, setDepartureFlightData] = useState(null);
  const [returnFlightData, setReturnFlightData] = useState(null);
  const [departureOption, setDepartureOption] = useState(null);
  const [returnOption, setReturnOption] = useState(null);
  
  // --- STATE UI & LOGIC ---
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [isPassengerInfoFilled, setIsPassengerInfoFilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPassengerInfoOpen, setIsPassengerInfoOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [passengersRaw, setPassengersRaw] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // --- STATE GHẾ ---
  const [flightSeats, setFlightSeats] = useState([]);
  
  // THAY ĐỔI 1: State lưu ghế dạng Object { "paxId": "seatNumber" }
  const [selectedAssignments, setSelectedAssignments] = useState({}); 
  
  const [isSeatSelectionOpen, setIsSeatSelectionOpen] = useState(false);
  const [aircraftNumCols, setAircraftNumCols] = useState(6);
  const [allowedSeatClass, setAllowedSeatClass] = useState("ECONOMY");

  const { personalInfo, loading: accountLoading } = useAccountInfo();

  // Helper: Tạo mảng ID ghế để tương thích với các logic cũ nếu cần
  const selectedSeatIds = useMemo(() => Object.values(selectedAssignments), [selectedAssignments]);

  /**
   * 1. USE EFFECT: FETCH DATA & TÍNH GIÁ
   * (Giữ nguyên toàn bộ logic cũ của bạn)
   */
  useEffect(() => {
    if (!departureFlightId) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        setSelectedAssignments({}); // Reset ghế khi load lại
        
        // Lấy thông tin chuyến bay
        const flight = await masterDataService.getFlightById(departureFlightId);
        
        // Lấy danh sách ghế
        const seats = Array.isArray(flight?.flightSeatList) 
            ? flight?.flightSeatList
            : [];
        setFlightSeats(seats);

        // Tính số cột
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

        // --- LOGIC TÍNH GIÁ CŨ (GIỮ NGUYÊN) ---
        let flightPrice = null;
        const requested = String(normalizedTicketClassName || "ECONOMY").toUpperCase();
        
        const isClassMatch = (requestedName, actualName) => {
          const req = String(requestedName || "").toUpperCase();
          const act = String(actualName || "").toUpperCase();
          if (!req) return true;
          if (req === "PREMIUM_ECONOMY" || req === "PREMIUM") return act === "PREMIUM_ECONOMY" || act === "PREMIUM";
          if (req === "BUSINESS" || req === "BUSINESS_CLASS" || req === "BUSINESS_PREMIER") return act === "BUSINESS" || act === "BUSINESS_CLASS" || act === "BUSINESS_PREMIER";
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

            const multiplier = (req === "BUSINESS" || req === "BUSINESS_CLASS" || req === "BUSINESS_PREMIER") ? 2 : (req === "PREMIUM_ECONOMY" || req === "PREMIUM") ? 1.5 : 1;
            if (multiplier === 1) return null;
            return {
                basePrice: Math.round(econBase * multiplier),
                tax: Math.round(econTax * multiplier),
                ticketClass: { className: req },
            };
        };

        try {
          flightPrice = await masterDataService.getFlightPriceById(departureFlightId, normalizedTicketClassName);
        } catch (e) { flightPrice = null; }

        const actualClassName = String(flightPrice?.ticketClass?.className || "").toUpperCase();
        const hasMismatch = requested && flightPrice && !isClassMatch(requested, actualClassName);
        const hasZeroPrice = flightPrice && (Number(flightPrice?.basePrice ?? 0) + Number(flightPrice?.tax ?? 0)) <= 0;
        
        if (!flightPrice || hasMismatch || hasZeroPrice) {
          try {
            const allPrices = await masterDataService.getFlightPricesByFlightId(departureFlightId);
            const picked = pickFromAllPrices(allPrices, requested);
            flightPrice = picked || computeFromEconomy(allPrices, requested) || flightPrice;
          } catch (e2) { flightPrice = flightPrice; }
        }

        // Set Allowed Seat Class
        const ticketClass = String(flightPrice?.ticketClass?.className || normalizedTicketClassName || "ECONOMY").toUpperCase();
        if (ticketClass.includes("BUSINESS")) {
          setAllowedSeatClass("BUSINESS_PREMIER");
        } else if (ticketClass.includes("PREMIUM")) {
          setAllowedSeatClass("PREMIUM_ECONOMY");
        } else {
          setAllowedSeatClass("ECONOMY");
        }

        // Set Flight Data
        const depDt = flight?.departureDateTime ? new Date(flight.departureDateTime) : null;
        const arrDt = flight?.arrivalDateTime ? new Date(flight.arrivalDateTime) : null;
        const depSec = depDt && !Number.isNaN(depDt.getTime()) ? Math.floor(depDt.getTime() / 1000) : Math.floor(Date.now() / 1000);
        const arrSec = arrDt && !Number.isNaN(arrDt.getTime()) ? Math.floor(arrDt.getTime() / 1000) : depSec;

        const departureCity = flight?.schedule?.departureAirport?.city || flight?.departureAirportCode || "";
        const arrivalCity = flight?.schedule?.arrivalAirport?.city || flight?.arrivalAirportCode || "";

        const base = Number(flightPrice?.basePrice ?? 0);
        const tax = Number(flightPrice?.tax ?? 0);
        let perPassengerAmount = base + tax;

        if (perPassengerAmount <= 0 || !isClassMatch(requested, String(flightPrice?.ticketClass?.className || ""))) {
           const econBase = Number(flight?.basePrice ?? 0);
           const econTax = Number(flight?.tax ?? 0);
           const econTotal = econBase + econTax;
           if (econTotal > 0) {
             const multiplier = (requested.includes("BUSINESS")) ? 2 : (requested.includes("PREMIUM")) ? 1.5 : 1;
             perPassengerAmount = Math.round(econTotal * multiplier);
           }
        }

        setDepartureFlightData({
          flightId: String(flight?.flightId ?? departureFlightId),
          flightNumber: flight?.flightNumber || flight?.schedule?.flightNumber || "",
          departureTime: { seconds: depSec },
          arrivalTime: { seconds: arrSec },
          departureCity,
          arrivalCity,
          basePrice: perPassengerAmount,
          aircraft: flight?.aircraft,  // Thêm aircraft để lấy totalSeats và numCols
        });

        const classNameUpper = String(normalizedTicketClassName || "").toUpperCase();
        const optionName = (classNameUpper.includes("BUSINESS")) ? "Thương gia" : (classNameUpper.includes("PREMIUM")) ? "Premium Economy" : "Phổ thông";
        setDepartureOption({
          id: departureOptionId || "default",
          name: optionName,
          price: perPassengerAmount,
        });

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
  }, [departureFlightId, departureOptionId, returnFlightId, returnOptionId, normalizedTicketClassName]);

  const totalAmount = (departureOption?.price + (returnOption?.price || 0)) * parseInt(passengerCount || 1, 10);
  
  const handlePassengerInfoFilled = () => {
    setIsPassengerInfoFilled(true);
  };

  /**
   * 2. LOGIC MỚI: MAPPING PASSENGERS
   * (Đây là phần quan trọng để UI hiển thị badge ghế đã chọn)
   */
  const passengers = useMemo(() => {
    let baseList = passengersRaw;
    
    // Fallback nếu chưa nhập thông tin khách (hoặc đang dev)
    if (!baseList || baseList.length === 0) {
        const count = parseInt(passengerCount || 1);
        baseList = Array.from({ length: count }).map((_, i) => ({
            id: `pax-${i}`,
            fullName: `Hành khách ${i + 1}`,
            type: 'adult',
            nationality: 'Vietnam'
        }));
    }

    // Merge: Khách + Ghế đã chọn (Assignment)
    return baseList.map(p => ({
        ...p,
        seat: selectedAssignments[p.id] || null, // Map ghế vào khách
        name: p.fullName || `Hành khách`, 
    }));
  }, [passengersRaw, selectedAssignments, passengerCount]);


  /**
   * 3. LOGIC MỚI: CHỌN GHẾ
   * (Hỗ trợ chọn theo Passenger ID)
   */
  const toggleSeatSelection = (seatId, passengerId) => {
    // Validate Input
    if (!seatId || !passengerId) return;

    // Tìm thông tin ghế
    const seat = Array.isArray(flightSeats)
      ? flightSeats.find((s) => s.seatNumber === seatId || s.id === seatId)
      : null;

    if (!seat) {
        toast({ title: "Lỗi", description: "Không tìm thấy thông tin ghế.", variant: "destructive" });
        return;
    }

    // Kiểm tra Hạng ghế
    const seatClass = seat.seatClass;
    if (allowedSeatClass && allowedSeatClass !== 'ALL' && seatClass !== allowedSeatClass) {
       toast({
        title: "Sai hạng ghế",
        description: `Vé của bạn không được chọn ghế hạng ${seatClass}.`,
        variant: "destructive",
      });
      return;
    }

    // Cập nhật State Assignments
    setSelectedAssignments((prev) => {
        const newAssignments = { ...prev };

        // Kiểm tra: Ghế này có ai khác chọn chưa?
        const occupantId = Object.keys(newAssignments).find(
            (pid) => newAssignments[pid] === seatId
        );

        if (occupantId && occupantId !== passengerId) {
             toast({ title: "Ghế đã chọn", description: "Ghế này đã có người khác chọn.", variant: "destructive" });
             return prev;
        }

        // Toggle: Nếu đang chọn -> Bỏ chọn. Nếu chưa -> Chọn.
        if (newAssignments[passengerId] === seatId) {
            delete newAssignments[passengerId];
        } else {
            newAssignments[passengerId] = seatId;
        }

        return newAssignments;
    });
  };

  const confirmSeatSelection = () => {
    const expectedSeatCount = parseInt(passengerCount || 1, 10);
    if (Object.keys(selectedAssignments).length !== expectedSeatCount) {
      toast({
        title: "Chưa đủ ghế",
        description: `Vui lòng chọn đủ ${expectedSeatCount} ghế.`,
        variant: "destructive",
      });
      return;
    }
    // Logic check mismatch hạng ghế (Defensive)
    const selectedSeatNumbers = Object.values(selectedAssignments);
    const selectedSeats = flightSeats.filter((s) => selectedSeatNumbers.includes(s.seatNumber));
    const mismatch = selectedSeats.some((s) => s?.seatClass && s.seatClass !== allowedSeatClass);
    
    if (mismatch) {
      toast({ title: "Sai hạng ghế", description: "Có ghế không đúng hạng vé.", variant: "destructive" });
      return;
    }
    setIsSeatSelectionOpen(false);
  };

  /**
   * 4. LOGIC THANH TOÁN (PAYMENT)
   * (Đã cập nhật để map từ Assignments sang FlightSeatId)
   */
  const handleConfirmPayment = async () => {
    const token = typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      toast({ title: "Chưa đăng nhập", description: "Vui lòng đăng nhập.", variant: "destructive" });
      return;
    }

    const expectedSeatCount = parseInt(passengerCount || 1, 10);
    if (Object.keys(selectedAssignments).length !== expectedSeatCount) {
      toast({ title: "Chưa chọn ghế", description: `Vui lòng chọn đủ ${expectedSeatCount} ghế.`, variant: "destructive" });
      return;
    }

    if (!passengersRaw || passengersRaw.length === 0) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập thông tin hành khách.", variant: "destructive" });
      return;
    }

    // Prepare Payload
    const mappedPassengers = passengersRaw.map((p) => {
      const fullName = `${p?.lastName || ""} ${p?.firstName || ""}`.trim() || p.fullName;
      const birth = p?.birthDate ? parse(p.birthDate, "dd/MM/yyyy", new Date()) : null;
      const dateOfBirth = birth ? format(birth, "yyyy-MM-dd") : p.dateOfBirth; 
      return {
        fullName,
        dateOfBirth,
        gender: p?.gender,
        nationality: p.nationality || "Vietnam",
      };
    });

 
    const selectedSeatNumbers = Object.values(selectedAssignments);
    const selectedFlightSeatIds = flightSeats
        .filter(s => selectedSeatNumbers.includes(s.seatNumber))
        .map(s => s.flightSeatId || s.seatNumber);


    setIsCreatingBooking(true);
    try {
      const payload = {
        flightId: Number(departureFlightId),
        listFlightSeatId: selectedFlightSeatIds,
        listPassengerRequest: mappedPassengers,
        ticketClassName: normalizedTicketClassName ? String(normalizedTicketClassName).toUpperCase() : null,
      };

      const booking = await createBooking(payload);
      
      const bookingCode = booking?.bookingCode || String(booking?.bookingId || "");
      const bookingIdRes = booking?.bookingId;
      const backendTotalAmount = Number(booking?.totalAmount || 0);
      setBookingId(bookingCode);
      
      const flightInfo = {
        flightNumber: departureFlightData?.flightNumber || "",
        route: `${departureFlightData?.departureCity || ""} → ${departureFlightData?.arrivalCity || ""}`,
        date: departureFlightData?.departureTime?.seconds ? new Date(departureFlightData.departureTime.seconds * 1000).toLocaleDateString('vi-VN') : "",
        ticketClass: normalizedTicketClassName || "ECONOMY"
      };

      const baseTotalAmountToPay = backendTotalAmount > 0 ? backendTotalAmount : totalAmount;

      router.push({
        pathname: '/payment',
        query: {
            bookingId: bookingIdRes,
            bookingCode: bookingCode,
            totalAmount: baseTotalAmountToPay,
            baseTotalAmount: baseTotalAmountToPay,
            flightInfo: JSON.stringify(flightInfo)
        }
      });
      
      toast({ title: "Thành công", description: "Đang chuyển đến trang thanh toán..." });
    } catch (e) {
      const backendCode = e?.response?.data?.code;
      const msg = backendCode === 8010 ? "Ghế bạn chọn đã hết." 
                : backendCode === 8011 ? "Sai hạng vé." 
                : (e?.response?.data?.message || "Lỗi đặt vé.");
      toast({ title: "Đặt vé thất bại", description: msg, variant: "destructive" });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleReturnHome = () => router.push("/");
  const handleOpenPassengerInfo = () => setIsPassengerInfoOpen(true);
  const handleSavePassengerInfo = async (passengerData) => setPassengersRaw(passengerData);

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
    
    // --- CÁC FIELD MỚI CẦN THIẾT CHO UI ---
    flightSeats,
    selectedAssignments, // State map ghế
    passengers,          // List khách đã map ghế
    selectedSeatIds,     // List ID (để tương thích)
    
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