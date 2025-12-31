'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plane, Info, RefreshCw, Luggage, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import * as masterDataService from "@/services/masterDataService";

// --- SUB-COMPONENTS ---

// Component cho phần giá (Price Pill/Card)
function PricePill({ flightIndex, classType, price, seatsLeft, onClick, isExpanded, label, disabled }) {
    const colorMap = {
        economy: { bg: "bg-blue-600", hover: "hover:bg-blue-700" },
        premium: { bg: "bg-purple-600", hover: "hover:bg-purple-700" },
        business: { bg: "bg-amber-600", hover: "hover:bg-amber-700" },
    };
    const colors = colorMap[classType] || colorMap.economy;
    const bgColor = disabled ? "bg-gray-400" : colors.bg;
    const hoverColor = disabled ? "" : colors.hover;
    const expandedColor = isExpanded ? "ring-4 ring-offset-2 ring-orange-300" : "";
    
    return (
        <button
            className={cn(
                "w-full p-3 rounded-xl text-white transition-all duration-300 relative shadow-md hover:shadow-lg",
                bgColor,
                hoverColor,
                expandedColor,
                disabled && "cursor-not-allowed opacity-70"
            )}
            onClick={() => !disabled && onClick(flightIndex, classType)}
            disabled={disabled}
        >
            <div className="font-semibold text-lg">{label}</div>
            <div className="text-xl font-extrabold mt-0.5">{price > 0 ? `${price.toLocaleString()} VND` : "Liên hệ"}</div>
            
            {seatsLeft && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                    Chỉ còn {seatsLeft}
                </span>
            )}
        </button>
    );
}

// Component cho chi tiết quyền lợi (Dùng trong Expanded Section)
function BenefitItem({ Icon, title, value }) {
    const isFree = value.toLowerCase().includes('miễn phí') || value.toLowerCase().includes('0');
    return (
        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <Icon className={cn("h-5 w-5 mt-1 flex-shrink-0", isFree ? "text-green-600" : "text-gray-500")} />
            <div>
                <div className="font-medium text-gray-800">{title}</div>
                <div className={cn("text-sm", isFree ? "text-green-700 font-semibold" : "text-gray-600")}>{value}</div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT REDESIGN ---

export function FlightCard({ flights, passengerCount, onSelectFlight }) {
    const [expandedFlight, setExpandedFlight] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    const [flightPricesMap, setFlightPricesMap] = useState({});

    useEffect(() => {
        const fetchAllPrices = async () => {
            const map = {};
            for (const flight of flights) {
                try {
                    const result = await masterDataService.getFlightPricesByFlightId(flight.id);
                    const normalizedPrices = Array.isArray(result)
                        ? result
                        : Array.isArray(result?.body)
                            ? result.body
                            : [];
                    map[flight.id] = normalizedPrices;
                } catch (e) {
                    console.error(`Failed to fetch prices for flight ${flight.id}`, e);
                    map[flight.id] = [];
                }
            }
            setFlightPricesMap(map);
        };
        if (flights?.length) {
            fetchAllPrices();
        }
    }, [flights]);

    const handleExpand = (flightIndex, classType) => {
        if (expandedFlight === flightIndex && expandedClass === classType) {
            setExpandedFlight(null);
            setExpandedClass(null);
        } else {
            setExpandedFlight(flightIndex);
            setExpandedClass(classType);
        }
    };

    return (
        <div className="flex-1 space-y-6">
            {flights.map((flight, index) => {
                const prices = Array.isArray(flightPricesMap[flight.id]) ? flightPricesMap[flight.id] : [];
                const economyPriceItem = prices.find(
                    (p) => String(p?.ticketClass?.className || "").toUpperCase() === "ECONOMY"
                );
                const premiumPriceItem = prices.find(
                    (p) => {
                        const name = String(p?.ticketClass?.className || "").toUpperCase();
                        return name === "PREMIUM_ECONOMY" || name === "PREMIUM";
                    }
                );
                const businessPriceItem = prices.find(
                    (p) => String(p?.ticketClass?.className || "").toUpperCase() === "BUSINESS"
                );
                const economyTotalPrice = Number(economyPriceItem?.basePrice ?? 0) + Number(economyPriceItem?.tax ?? 0);
                const premiumTotalPrice = Number(premiumPriceItem?.basePrice ?? 0) + Number(premiumPriceItem?.tax ?? 0);
                const businessTotalPrice = Number(businessPriceItem?.basePrice ?? 0) + Number(businessPriceItem?.tax ?? 0);
                const economyFallbackPrice = economyTotalPrice || Number(flight.economyPrice || 0);
                const computedPremiumPrice = premiumTotalPrice > 0
                    ? premiumTotalPrice
                    : (economyFallbackPrice > 0 ? Math.round(economyFallbackPrice * 1.5) : 0);
                const computedBusinessPrice = businessTotalPrice > 0
                    ? businessTotalPrice
                    : (economyFallbackPrice > 0 ? Math.round(economyFallbackPrice * 2) : 0);
                const hasPremiumPrice = Boolean(premiumPriceItem);
                const hasBusinessPrice = Boolean(businessPriceItem);

                const getTicketClassName = (classType) => {
                    if (classType === "economy") return "ECONOMY";
                    if (classType === "premium") return "PREMIUM_ECONOMY";
                    if (classType === "business") return "BUSINESS";
                    return "ECONOMY";
                };

                const getClassPrice = (classType) => {
                    if (classType === "economy") return economyTotalPrice || flight.economyPrice || 0;
                    if (classType === "premium") return computedPremiumPrice;
                    if (classType === "business") return computedBusinessPrice;
                    return 0;
                };

                const getClassLabel = (classType) => {
                    if (classType === "economy") return "Phổ thông";
                    if (classType === "premium") return "Premium Economy";
                    if (classType === "business") return "Thương gia";
                    return "";
                };

                const getClassOptions = (classType) => {
                    if (classType === "economy") return flight.economyOptions || [];
                    if (classType === "business") return (flight.businessOptions || []).map((opt) => ({
                        ...opt,
                        price: computedBusinessPrice,
                    }));
                    if (classType === "premium") return [{
                        id: "pre",
                        name: "Premium Economy",
                        price: computedPremiumPrice,
                        changeFee: 0,
                        refundFee: 0,
                        checkedBaggage: "1 x 25 kg",
                        carryOn: "Không quá 12kg",
                    }];
                    return [];
                };

                return (
                    <Card key={index} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                {/* LEFT: Flight Route & Times (Trực quan hóa Hành trình) */}
                                <div className="md:w-3/5 p-4 flex flex-col justify-center">
                                    <div className="flex justify-between items-center">
                                        {/* Departure */}
                                        <div className="flex flex-col items-center flex-1 min-w-[80px]">
                                            <span className="text-3xl font-extrabold text-gray-900">{flight.departureTime}</span>
                                            <span className="text-sm font-medium text-gray-700">{flight.departureCode}</span>
                                        </div>

                                        {/* Route Line */}
                                        <div className="flex-auto flex flex-col items-center px-4 relative">
                                            <div className="w-full h-[2px] bg-gray-300 absolute top-1/2 -translate-y-1/2"></div>
                                            <Plane className="h-6 w-6 text-orange-500 bg-white p-1 rounded-full relative z-10 -rotate-45" />
                                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {flight.duration}
                                            </div>
                                        </div>

                                        {/* Arrival */}
                                        <div className="flex flex-col items-center flex-1 min-w-[80px]">
                                            <span className="text-3xl font-extrabold text-gray-900">{flight.arrivalTime}</span>
                                            <span className="text-sm font-medium text-gray-700">{flight.arrivalCode}</span>
                                        </div>
                                    </div>

                                    {/* Flight Number & Info Button */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Số hiệu: <span className="font-mono font-semibold text-gray-700">{flight.flightNumber}</span>
                                        </span>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                                    <Info className="h-4 w-4" /> Chi tiết
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[550px]">
                                                {/* Dialog Content (Giữ nguyên từ bản gốc) */}
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold mb-4 text-blue-700">Chi tiết hành trình</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-6">
                                                    {/* Route Info Block */}
                                                    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                                        <div className="flex flex-col items-center"><div className="text-3xl font-bold text-blue-700">{flight.departureTime}</div><div className="text-lg font-semibold">{flight.departureCode}</div><div className="text-sm text-gray-600">{flight.departureAirport}</div></div>
                                                        <div className="flex flex-col items-center"><Plane className="text-orange-500 mb-2" /><div className="text-sm font-medium">{flight.duration}</div></div>
                                                        <div className="flex flex-col items-center"><div className="text-3xl font-bold text-blue-700">{flight.arrivalTime}</div><div className="text-lg font-semibold">{flight.arrivalCode}</div><div className="text-sm text-gray-600">{flight.arrivalAirport}</div></div>
                                                    </div>
                                                    {/* Flight Details */}
                                                    <div className="space-y-2 text-sm">
                                                        <div><span className="font-semibold text-gray-700">Khởi hành:</span> <span>{flight.departureDate}</span></div>
                                                        <div><span className="font-semibold text-gray-700">Hãng hàng không:</span> <span>{flight.airline}</span></div>
                                                        <div><span className="font-semibold text-gray-700">Loại máy bay:</span> <span>{flight.aircraft}</span></div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>

                                {/* RIGHT: Price Selector (Thẻ giá tương tác) */}
                                <div className="md:w-2/5 p-4 flex flex-col justify-center space-y-2">
                                    {["economy", "premium", "business"].map((classType) => (
                                        <PricePill
                                            key={classType}
                                            flightIndex={index}
                                            classType={classType}
                                            price={getClassPrice(classType)}
                                            seatsLeft={classType === "economy" ? flight.seatsLeft : null}
                                            onClick={handleExpand}
                                            isExpanded={expandedFlight === index && expandedClass === classType}
                                            label={getClassLabel(classType)}
                                            disabled={false}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Expanded Section (Chi tiết quyền lợi) */}
                            {expandedFlight === index && ["economy", "premium", "business"].includes(expandedClass) && (
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    <h3 className="font-bold text-lg text-gray-900 mb-4 border-l-4 border-orange-500 pl-3">
                                        Chi tiết hạng vé: {getClassLabel(expandedClass)}
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {getClassOptions(expandedClass).map((option, optionIndex) => (
                                            <div key={optionIndex} className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
                                                {/* Price Option Header */}
                                                <div className="mb-4">
                                                    <div className="text-lg font-extrabold text-center mb-1">{option.name}</div>
                                                    <div className="text-3xl font-extrabold text-blue-700 text-center">
                                                        {getClassPrice(expandedClass) > 0 ? `${getClassPrice(expandedClass).toLocaleString()} VND` : "Liên hệ"}
                                                    </div>
                                                </div>

                                                {/* Benefits List */}
                                                <div className="space-y-3 text-sm flex-grow">
                                                    <BenefitItem
                                                        Icon={RefreshCw}
                                                        title="Thay đổi vé"
                                                        value={option.changeFee > 0 ? `Phí tối đa ${option.changeFee.toLocaleString()} VND` : "Miễn phí (Tùy điều kiện)"}
                                                    />
                                                    <BenefitItem
                                                        Icon={Luggage}
                                                        title="Hành lý ký gửi"
                                                        value={option.checkedBaggage}
                                                    />
                                                    <BenefitItem
                                                        Icon={Luggage}
                                                        title="Hành lý xách tay"
                                                        value={option.carryOn}
                                                    />
                                                    <BenefitItem
                                                        Icon={RefreshCw}
                                                        title="Hoàn vé"
                                                        value={option.refundFee > 0 ? `Phí tối đa ${option.refundFee.toLocaleString()} VND` : "Không áp dụng"}
                                                    />
                                                </div>

                                                {/* Select Button */}
                                                <Button
                                                    className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                                                    onClick={() =>
                                                        onSelectFlight({
                                                            id: flight.id,
                                                            selectedOptionId: option.id,
                                                            passengerCount,
                                                            autoNavigate: true,
                                                            ticketClassName: getTicketClassName(expandedClass),
                                                        })
                                                    }
                                                >
                                                    Mua vé {getClassLabel(expandedClass)}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center text-sm text-gray-700 mt-4">Giá vé đã bao gồm thuế và phí.</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}