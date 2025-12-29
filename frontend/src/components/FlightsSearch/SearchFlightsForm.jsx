'use client';

import { useState } from "react";
import { 
  MdSearch, 
  MdFlight, 
  MdExpandMore, 
  MdLocationOn, 
  MdMyLocation,
  MdCalendarToday,
  MdPerson,
  MdGroup,
  MdClose
} from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import AirportSelect from "./AirportSelect"; // Giữ nguyên component này

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFlightSearch from "@/hooks/useFlightSearch";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Giả định utility cn có sẵn

function SearchFlights({ onSearch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleExpand = () => setIsExpanded(true);
  const handleCollapse = () => setIsExpanded(false);

  const {
    fromAirport, setFromAirport,
    toAirport, setToAirport,
    departureDate, setDepartureDate,
    returnDate, setReturnDate,
    tripType, setTripType,
    swapAirports,
    isValid,
  } = useFlightSearch();

  const handleSwap = async () => {
    setIsSwapping(true);
    await swapAirports();
    setTimeout(() => setIsSwapping(false), 500);
  };

  const passengerCount = adultCount + childCount;

  const handleSearch = () => {
    if (!isValid) return;
    onSearch({
      fromAirport,
      toAirport,
      departureDate: departureDate?.toISOString(),
      returnDate: tripType === 'roundTrip' ? returnDate?.toISOString() : null,
      tripType,
      passengerCount,
    });
    handleCollapse(); 
  };

  // --- Helper Component: Input Field ---
  const InputField = ({ label, icon, value, isAirport = false, onChange, placeholder, isSwapping }) => (
    <div
      className={cn(
        "flex-1 bg-muted/80 rounded-xl p-3 border border-border",
        "transition-all duration-300 hover:border-primary/50 shadow-inner",
        isSwapping ? "animate-pulse" : ""
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex-1">
          {/* Tăng tương phản cho Label */}
          <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
          {isAirport ? (
            <AirportSelect
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              // Đảm bảo text-foreground cho giá trị đã chọn
              className="border-none p-0 text-base font-bold text-foreground bg-transparent w-full"
            />
          ) : (
            <span className="text-sm font-bold text-foreground">
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // --- Helper Component: Date Field ---
  const DateField = ({ label, date, setDate, minDate, compact = true }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
            compact ? "bg-muted/80 border border-border hover:border-secondary shadow-inner min-w-[140px]" : "w-full bg-background border border-border hover:border-secondary shadow-sm"
          )}
        >
          <MdCalendarToday className="text-primary text-lg" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
            {/* Tăng tương phản cho giá trị ngày */}
            <span className="text-base font-bold text-foreground">
              {date ? format(date, compact ? "dd/MM" : "EEEE, dd MMM yyyy") : (compact ? "Chọn ngày" : `Chọn ${label.toLowerCase()}`)}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-border shadow-2xl rounded-2xl z-50">
        <Calendar
          mode="single"
          disabled={(date) => date < minDate}
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  );

  // --- Helper Component: Passenger Counter ---
  const PassengerCounter = ({ label, subLabel, count, setCount, minCount = 0 }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background shadow-sm border border-border">
      <div>
        <span className="font-medium text-foreground">{label}</span>
        <p className="text-xs text-muted-foreground">{subLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCount(Math.max(minCount, count - 1))}
          className="w-8 h-8 rounded-full bg-muted text-primary hover:bg-secondary transition-colors font-bold flex items-center justify-center"
        >
          -
        </button>
        {/* Tăng tương phản cho số lượng */}
        <span className="font-bold w-6 text-center text-lg text-foreground">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
  
  // --- RENDERING ---
  return (
    <>
      {/* Overlay khi form mở */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={handleCollapse}
        />
      )}

      {/* Main Compact Form */}
      <div className="relative z-50 max-w-7xl mx-auto">
        <div
          className={cn(
            "bg-white/95 backdrop-blur-md border border-border",
            "rounded-3xl p-4 shadow-2xl shadow-primary/20",
            "hover:shadow-primary/30 transition-all duration-500",
            isExpanded ? "ring-4 ring-primary" : ""
          )}
        >
          <div className="flex items-center gap-3">
            
            {/* From Airport */}
            <InputField
              label="TỪ"
              icon={<MdLocationOn className="text-primary text-lg" />}
              placeholder="Chọn điểm đi"
              value={fromAirport}
              onChange={setFromAirport}
              isAirport={true}
              isSwapping={isSwapping}
            />

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className={cn(
                "bg-primary p-3 rounded-full text-primary-foreground shadow-lg",
                "hover:shadow-xl hover:scale-110 active:scale-95",
                "transition-all duration-300 transform flex-shrink-0",
                isSwapping ? "animate-spin" : ""
              )}
            >
              <FaExchangeAlt size={18} />
            </button>

            {/* To Airport */}
            <InputField
              label="ĐẾN"
              icon={<MdMyLocation className="text-primary text-lg" />}
              placeholder="Chọn điểm đến"
              value={toAirport}
              onChange={setToAirport}
              isAirport={true}
              isSwapping={isSwapping}
            />

            {/* Date Picker - Compact */}
            <DateField
              label="NGÀY ĐI"
              date={departureDate}
              setDate={setDepartureDate}
              minDate={new Date()}
              compact={true}
            />

            {/* Passenger Compact Display (Opens Expanded Form) */}
            <button 
                onClick={handleExpand}
                className="flex items-center gap-3 px-4 py-3 rounded-xl 
                           bg-muted/80 border border-border hover:border-secondary
                           transition-all duration-300 min-w-[140px] shadow-inner"
            >
                <MdGroup size={20} className="text-primary" />
                <div className="text-left">
                    <p className="text-xs text-muted-foreground font-medium uppercase">HÀNH KHÁCH</p>
                    <span className="text-base font-bold text-foreground">
                        {passengerCount} Người
                    </span>
                </div>
                <MdExpandMore size={20} className="text-muted-foreground ml-auto" />
            </button>

            {/* Search Button - Glowing Effect */}
            <button
              onClick={handleSearch}
              disabled={!isValid}
              className={cn(
                "relative px-6 py-4 rounded-xl font-bold text-primary-foreground text-lg",
                "bg-primary shadow-lg hover:shadow-xl transition-all duration-300",
                "hover:scale-105 active:scale-95 flex-shrink-0 min-w-[160px]",
                "disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden"
              )}
            >
              <div className={cn("absolute inset-0 rounded-xl blur-md bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500", isValid && "animate-pulse")} />
              <div className="relative flex items-center gap-2 justify-center">
                <MdSearch size={24} />
                <span>TÌM VÉ</span>
              </div>
            </button>
          </div>

          {/* Expand Trigger */}
          {!isExpanded && (
            <button
              onClick={handleExpand}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2
                         bg-primary text-primary-foreground rounded-full p-2
                         shadow-lg hover:shadow-xl transition-all duration-300
                         hover:scale-110"
            >
              <MdExpandMore size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Panel - Advanced Options (Modal/Dialog) */}
      {isExpanded && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-[95vw] max-w-3xl bg-background rounded-3xl p-8
              shadow-2xl border border-border z-50
              animate-in zoom-in-95 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleCollapse}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <MdClose size={30} />
          </button>

          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <MdFlight className="text-primary text-3xl" />
              <h2 className="text-2xl font-extrabold text-foreground">Tùy Chọn Tìm Kiếm Nâng Cao</h2>
            </div>

            {/* Trip Type Selection */}
            <div>
              <label className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase">
                <MdFlight className="text-primary" /> Loại Hành Trình
              </label>
              <RadioGroup
                value={tripType}
                onValueChange={setTripType}
                className="flex flex-col sm:flex-row gap-3"
              >
                {[
                  { value: "roundTrip", label: "Khứ hồi", icon: <FaExchangeAlt className="mr-2" /> },
                  { value: "oneWay", label: "Một chiều", icon: <MdFlight className="mr-2" /> },
                  { value: "multiLeg", label: "Nhiều chặng", icon: <MdGroup className="mr-2" /> }
                ].map(({ value, label, icon }) => (
                  <div key={value} className="flex-1">
                    <RadioGroupItem value={value} id={`exp-${value}`} className="sr-only" />
                    <label
                      htmlFor={`exp-${value}`}
                      className={cn(
                        "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer",
                        "transition-all duration-300 text-center font-semibold text-lg",
                        tripType === value 
                          ? "border-primary bg-primary/10 text-primary shadow-md scale-[1.01]" 
                          : "border-muted bg-muted text-muted-foreground hover:border-secondary" // Đảm bảo text-muted-foreground trên nền muted
                      )}
                    >
                      {icon}
                      <span className="ml-2">{label}</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Dates & Passengers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Return Date (Conditional) */}
              {tripType === "roundTrip" && (
                <div className="bg-muted rounded-xl p-5 border border-border shadow-inner">
                  <label className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase">
                    <MdCalendarToday className="text-primary" /> NGÀY VỀ
                  </label>
                  <DateField 
                    label="NGÀY VỀ"
                    date={returnDate}
                    setDate={setReturnDate}
                    minDate={departureDate}
                    compact={false}
                  />
                </div>
              )}

              {/* Passenger Selection */}
              <div className={cn(
                  "rounded-xl p-5 border border-border shadow-inner bg-muted",
                  tripType === "oneWay" && "lg:col-span-2"
                )}>
                <label className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase border-b border-border pb-2">
                  <MdGroup className="text-primary" /> Hành Khách
                </label>
                <div className="space-y-4 pt-2">
                  <PassengerCounter label="Người lớn" subLabel="Từ 12 tuổi" count={adultCount} setCount={setAdultCount} minCount={1} />
                  <PassengerCounter label="Trẻ em" subLabel="2 - 11 tuổi" count={childCount} setCount={setChildCount} />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <h3 className="font-bold text-lg text-primary">TỔNG</h3>
                    <span className="text-2xl font-extrabold text-primary">{passengerCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={handleCollapse}
                className="flex-1 py-3 px-6 border-2 border-border text-foreground rounded-xl font-bold hover:bg-muted transition-colors"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleSearch}
                disabled={!isValid}
                className={cn(
                  "flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-xl font-bold",
                  "hover:bg-primary/90 transition-colors disabled:opacity-30 shadow-lg shadow-primary/30",
                  "flex items-center justify-center gap-2 text-lg"
                )}
              >
                <MdSearch size={22} />
                TÌM KIẾM CHUYẾN BAY
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchFlights;