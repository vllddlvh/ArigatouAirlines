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
  const [isSwapping, setIsSwapping] = useState(false);

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

  const handleSearch = () => {
    if (!isValid) return;
    onSearch({
      fromAirport,
      toAirport,
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : null,
    });
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
    <div className="relative z-50 max-w-7xl mx-auto">
      <div
        className={cn(
          "bg-white/95 backdrop-blur-md border border-border",
          "rounded-3xl p-4 shadow-2xl shadow-primary/20",
          "hover:shadow-primary/30 transition-all duration-500"
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
      </div>
    </div>
  );
}

export default SearchFlights;