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
import flightsData from "@/data/flights.json";

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

  // Fake data setup
  const [flights, setFlights] = useState(flightsData);
  const [returnFlights, setReturnFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000],
    airlines: [],
    stops: [],
  });

  useEffect(() => {
    if (isUrlDataMissing) {
      setLoading(false);
      return;
    }

    // Simulate fetching departure flights
    setLoading(true);
    // setTimeout(() => {
    //   const departureFlights = flightsData
    //   // .filter(
    //   //   (flight) => flight.departureCode === fromAirport && flight.arrivalCode === toAirport
    //   // );
    //   setFlights(departureFlights);
    //   setFilteredFlights(departureFlights);
    //   setLoading(false);
    // }, 1000); // Simulate delay
  }, [fromAirport, toAirport, departureDate, isUrlDataMissing]);

  useEffect(() => {
    // Apply filters to flights
    let filtered = flights;
    if (filters.priceRange) {
      filtered = filtered.filter(
        (flight) =>
          flight.economyPrice >= filters.priceRange[0] &&
          flight.economyPrice <= filters.priceRange[1]
      );
    }
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((flight) => filters.airlines.includes(flight.airline));
    }
    // Add more filter logic if needed
    setFilteredFlights(filtered);
  }, [flights, filters]);

  const fetchReturnFlights = (from, to, date) => {
    // Simulate fetching return flights
    setTimeout(() => {
      const returnFlightsData = flightsData.filter(
        (flight) => flight.departureCode === from && flight.arrivalCode === to
      );
      setReturnFlights(returnFlightsData);
    }, 1000);
  };

  const departureCity = fromAirport ? getCityByCode(fromAirport) : "Không xác định";
  const arrivalCity = toAirport ? getCityByCode(toAirport) : "Không xác định";
  const formattedDepartureDate = formatDateToVietnamese(departureDate);
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
        passengers={`${passengerCount || 1} hành khách`}
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
