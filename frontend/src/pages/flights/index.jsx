"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { FlightHeader } from "@/components/tours-component/FlightHeader";
import { FlightSideFilter } from "@/components/tours-component/FlightSideFilter";
import { FlightCard } from "@/components/tours-component/FlightCard";
import { SkeletonFlightCard } from "@/components/tours-component/SkeletonFlightCard";
import { FlightSelectionNotice } from "@/components/tours-component/FlightSelectionNotice";
import { Button } from "@/components/ui/button";

// import { useFlightData } from "@/hooks/useFlightData";
import airportsData from "@/data/airports_data.json";
import * as masterDataService from "@/services/masterDataService";

const getCityByCode = (code) => {
  for (const region of airportsData) {
    const airport = region.airports.find((airport) => airport.code === code);
    if (airport) return airport.city;
  }
  return "";
};

const formatDateToVietnamese = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: vi });
};

export default function FlightBooking() {
  const router = useRouter();
  const {
    fromAirport,
    toAirport,
    departureDate,
    returnDate,
    tripType,
    passengerCount,
  } = router.query;

  const isUrlDataMissing = !fromAirport || !toAirport || !departureDate;

  const [allFlights, setAllFlights] = useState([]);
  const [flights, setFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    budget: [100000, 6400000],
    departureTime: "all",
  });

  const formatTimeHHmm = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const d = new Date(dateTimeString);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatLongVietnameseDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const d = new Date(dateTimeString);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (departureTimeString, arrivalTimeString) => {
    const dep = new Date(departureTimeString);
    const arr = new Date(arrivalTimeString);
    if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return "N/A";

    const diffMs = arr.getTime() - dep.getTime();
    if (!Number.isFinite(diffMs) || diffMs <= 0) return "N/A";
    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} giờ ${minutes} phút`;
  };

  const mapApiFlightToUi = (flight) => {
    const economyPriceRaw = flight?.prices?.ECONOMY ?? flight?.basePrice;
    const economyPrice = Number(economyPriceRaw ?? 0);
    const businessPriceRaw = flight?.prices?.BUSINESS ?? (Number.isFinite(economyPrice) ? Math.round(economyPrice * 1.5) : undefined);

    const departureCode = flight?.departureAirportCode ?? flight?.departureAirport ?? "";
    const arrivalCode = flight?.arrivalAirportCode ?? flight?.arrivalAirport ?? "";

    return {
      id: flight?.scheduleId ?? flight?.id ?? flight?.flightId,
      departureTime: formatTimeHHmm(flight?.departureTime),
      arrivalTime: formatTimeHHmm(flight?.arrivalTime),
      departureCode,
      arrivalCode,
      duration: formatDuration(flight?.departureTime, flight?.arrivalTime),
      airline: flight?.airline || "Arigatou Airlines",
      economyPrice: Number.isFinite(economyPrice) ? economyPrice : 0,
      businessPrice: Number(businessPriceRaw ?? 0),
      seatsLeft: null,
      flightNumber: flight?.flightNumber,
      departureAirport: flight?.departureAirport || departureCode,
      arrivalAirport: flight?.arrivalAirport || arrivalCode,
      departureDate: formatLongVietnameseDate(flight?.departureTime),
      aircraft: flight?.aircraftType || "",
      economyOptions: [
        {
          id: "eco",
          name: "Phổ Thông",
          price: Number.isFinite(economyPrice) ? economyPrice : 0,
          changeFee: 0,
          refundFee: 0,
          checkedBaggage: "1 x 23 kg",
          carryOn: "Không quá 12kg",
        },
      ],
      businessOptions: [
        {
          id: "bus",
          name: "Thương Gia",
          price: Number(businessPriceRaw ?? 0),
          changeFee: 0,
          refundFee: 0,
          checkedBaggage: "2 x 23 kg",
          carryOn: "Không quá 12kg",
        },
      ],
    };
  };

  const filterFlightsByRouteAndDate = (uiFlights, { from, to, date }) => {
    let filtered = Array.isArray(uiFlights) ? uiFlights : [];
    if (from) filtered = filtered.filter((f) => String(f.departureCode || "").toUpperCase() === String(from).toUpperCase());
    if (to) filtered = filtered.filter((f) => String(f.arrivalCode || "").toUpperCase() === String(to).toUpperCase());

    if (date) {
      const target = new Date(date);
      if (!Number.isNaN(target.getTime())) {
        const y = target.getFullYear();
        const m = target.getMonth();
        const d = target.getDate();
        filtered = filtered.filter((f) => {
          const dt = new Date(f?.rawDepartureTime ?? "");
          if (Number.isNaN(dt.getTime())) return true;
          return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
        });
      }
    }

    return filtered;
  };

  useEffect(() => {
    if (!router.isReady) return;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await masterDataService.getAllFlights();
        const mapped = (Array.isArray(data) ? data : []).map((f) => {
          const ui = mapApiFlightToUi(f);
          return { ...ui, rawDepartureTime: f?.departureTime, rawArrivalTime: f?.arrivalTime };
        });

        setAllFlights(mapped);

        // Nếu có query search thì lọc theo route/date; nếu không thì show tất cả
        const departureFiltered = isUrlDataMissing
          ? mapped
          : filterFlightsByRouteAndDate(mapped, {
              from: fromAirport,
              to: toAirport,
              date: departureDate,
            });

        setFlights(departureFiltered);
        setFilteredFlights(departureFiltered);
      } catch (err) {
        const message = err?.message || String(err || "Không thể tải danh sách chuyến bay");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [router.isReady, fromAirport, toAirport, departureDate, isUrlDataMissing]);

  useEffect(() => {
    // Apply filters to flights
    let filtered = flights;
    if (filters.budget) {
      filtered = filtered.filter(
        (flight) =>
          flight.economyPrice >= filters.budget[0] &&
          flight.economyPrice <= filters.budget[1]
      );
    }
    if (filters.departureTime && filters.departureTime !== "all") {
      filtered = filtered.filter((flight) => {
        const dt = new Date(flight?.rawDepartureTime ?? "");
        if (Number.isNaN(dt.getTime())) return true;
        const hour = dt.getHours();

        if (filters.departureTime === "morning") return hour >= 5 && hour <= 11;
        if (filters.departureTime === "afternoon") return hour >= 12 && hour <= 17;
        if (filters.departureTime === "evening") return hour >= 18 && hour <= 23;
        if (filters.departureTime === "night") return hour >= 0 && hour <= 4;
        return true;
      });
    }
    // Add more filter logic if needed
    setFilteredFlights(filtered);
  }, [flights, filters]);

  const fetchReturnFlights = (from, to, date) => {
    const result = filterFlightsByRouteAndDate(allFlights, { from, to, date });
    setReturnFlights(result);
  };

  const departureCity = fromAirport ? getCityByCode(fromAirport) : "Tất cả";
  const arrivalCity = toAirport ? getCityByCode(toAirport) : "Tất cả";
  const formattedDepartureDate = departureDate ? formatDateToVietnamese(departureDate) : "N/A";
  const formattedReturnDate = returnDate ? formatDateToVietnamese(returnDate) : "N/A";

  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);

  const handleSelectDepartureFlight = (flight) => {
    setSelectedDepartureFlight(flight);

    if (tripType === "roundTrip") {
      setIsSelectingReturn(true);
      fetchReturnFlights(toAirport, fromAirport, returnDate);
    } else {
      router.push({
        pathname: "/confirm",
        query: {
          departureFlightId: flight.id,
          departureOptionId: flight.selectedOptionId,
          passengerCount,
        },
      });
    }
  };

  const handleSelectReturnFlight = (flight) => {
    router.push({
      pathname: "/confirm",
      query: {
        departureFlightId: selectedDepartureFlight.id,
        departureOptionId: selectedDepartureFlight.selectedOptionId,
        returnFlightId: flight.id,
        returnOptionId: flight.selectedOptionId,
        passengerCount,
      },
    });
  };

  if (error) return <div>Có lỗi xảy ra: {error}</div>;

  // Khi không chọn chiều về, sử dụng filteredFlights để áp dụng filter.
  const displayedFlights = isSelectingReturn ? returnFlights : filteredFlights;

  return (
    <div>
      <FlightHeader
        departureCode={fromAirport || "N/A"}
        arrivalCode={toAirport || "N/A"}
        departureCity={departureCity}
        arrivalCity={arrivalCity}
        departureDate={formattedDepartureDate}
        returnDate={formattedReturnDate}
        passengers={passengerCount || 1}
      />

      <div className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm min-h-screen max-w-6xl m-auto">
        {/* Truyền filters và setFilters vào FlightSideFilter */}
        <FlightSideFilter filters={filters} setFilters={setFilters} />

        <div className="flex-1 space-y-4">
          {!loading && (
            <FlightSelectionNotice isSelectingReturn={isSelectingReturn} />
          )}
          {loading ? (
            <>
              <SkeletonFlightCard />
              <SkeletonFlightCard />
              <SkeletonFlightCard />
            </>
          ) : (
            <FlightCard
              flights={displayedFlights}
              passengerCount={passengerCount}
              onSelectFlight={
                isSelectingReturn ? handleSelectReturnFlight : handleSelectDepartureFlight
              }
            />
          )}

          <div className="text-center text-sm text-gray-700">
            {loading ? (
              <>
                <SkeletonFlightCard />
                <SkeletonFlightCard />
                <SkeletonFlightCard />
              </>
            ) : isSelectingReturn ? (
              <span>Có {returnFlights.length} chuyến bay quay về</span>
            ) : (
              <span>Có {filteredFlights.length} chuyến bay</span>
            )}
          </div>

          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
