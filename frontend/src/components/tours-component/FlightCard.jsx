'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plane, Info, RefreshCw, Luggage, Clock, Check, X, ChevronRight, Users, Shield, Award,CheckCircle2,BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import * as masterDataService from "@/services/masterDataService";
import Link from "next/link";
// --- SUB-COMPONENTS ---

// Component cho phần giá (Price Pill/Card) - Thiết kế mới
function PricePill({ flightIndex, classType, price, seatsLeft, onClick, isExpanded, label, disabled }) {
    const colorMap = {
        economy: { 
            bg: "bg-gradient-to-r from-blue-500 to-blue-600", 
            hover: "hover:from-blue-600 hover:to-blue-700",
            shadow: "shadow-blue-100",
            text: "text-white"
        },
        premium: { 
            bg: "bg-gradient-to-r from-purple-500 to-purple-600", 
            hover: "hover:from-purple-600 hover:to-purple-700",
            shadow: "shadow-purple-100",
            text: "text-white"
        },
        business: { 
            bg: "bg-gradient-to-r from-amber-500 to-amber-600", 
            hover: "hover:from-amber-600 hover:to-amber-700",
            shadow: "shadow-amber-100",
            text: "text-white"
        },
    };
    
    const colors = colorMap[classType] || colorMap.economy;
    const bgColor = disabled ? "bg-gradient-to-r from-gray-300 to-gray-400" : colors.bg;
    const hoverColor = disabled ? "" : colors.hover;
    const expandedColor = isExpanded ? `ring-2 ring-offset-2 ring-blue-300 shadow-lg ${colors.shadow}` : "";
    
    return (
        <button
            className={cn(
                "w-full p-4 rounded-xl transition-all duration-300 relative overflow-hidden group",
                bgColor,
                hoverColor,
                expandedColor,
                disabled && "cursor-not-allowed opacity-70",
                "shadow-md hover:shadow-lg transform hover:-translate-y-1"
            )}
            onClick={() => !disabled && onClick(flightIndex, classType)}
            disabled={disabled}
        >
            {/* Hiệu ứng nền */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-semibold text-sm opacity-90 text-white">{label}</div>
                        <div className="text-xl font-bold mt-1 text-white">
                            {price > 0 ? `${price.toLocaleString()} ₫` : "Liên hệ"}
                        </div>
                    </div>
                    <ChevronRight className={cn(
                        "h-5 w-5 transition-transform duration-300 text-white",
                        isExpanded ? "rotate-90" : "group-hover:translate-x-1"
                    )} />
                </div>
                
                {seatsLeft && seatsLeft > 0 && seatsLeft < 10 && (
                    <div className="mt-2 flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium opacity-90">Chỉ còn {seatsLeft} chỗ</span>
                    </div>
                )}
            </div>
        </button>
    );
}

// Component cho chi tiết quyền lợi - Thiết kế mới
function BenefitItem({ Icon, title, value, positive = true }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors group">
            <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                positive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{title}</div>
                <div className={cn(
                    "text-sm mt-0.5",
                    positive ? "text-green-700 font-medium" : "text-gray-600"
                )}>
                    {value}
                </div>
            </div>
        </div>
    );
}

// Badge cho thông tin nổi bật
function InfoBadge({ children, type = "info" }) {
    const typeStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-green-50 text-green-700 border-green-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
    };
    
    return (
        <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            typeStyles[type]
        )}>
            {children}
        </span>
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
                    if (classType === "premium") return "Premium";
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
                    <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                        <CardContent className="p-0">
                            {/* Header với hãng bay và thông tin cơ bản */}
                            <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border">
                                            <Plane className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{flight.airline}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <InfoBadge>{flight.flightNumber}</InfoBadge>
                                                <InfoBadge type="success">{flight.aircraft}</InfoBadge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Khởi hành</div>
                                        <div className="font-semibold text-gray-900">{flight.departureDate}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                {/* LEFT: Flight Route & Times */}
                                <div className="lg:w-3/5 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        {/* Departure */}
                                        <div className="text-center flex-1">
                                            <div className="text-3xl font-bold text-gray-900 mb-1">{flight.departureTime}</div>
                                            <div className="text-lg font-semibold text-blue-700">{flight.departureCode}</div>
                                            <div className="text-sm text-gray-600 mt-1">{flight.departureAirport}</div>
                                        </div>

                                        {/* Route Line với timeline */}
                                        <div className="flex-auto px-6 relative">
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-300"></div>
                                                </div>
                                                <div className="relative flex justify-between items-center">
                                                    <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                                                    <Plane className="h-6 w-6 text-blue-600 animate-pulse" />
                                                    <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="text-center mt-3">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-700">{flight.duration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrival */}
                                        <div className="text-center flex-1">
                                            <div className="text-3xl font-bold text-gray-900 mb-1">{flight.arrivalTime}</div>
                                            <div className="text-lg font-semibold text-blue-700">{flight.arrivalCode}</div>
                                            <div className="text-sm text-gray-600 mt-1">{flight.arrivalAirport}</div>
                                        </div>
                                    </div>

                                    {/* Additional Info và Detail Button */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                            
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-1.5 text-gray-600" title="Số lượng hành khách">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{passengerCount} hành khách</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    <span className="font-medium">An toàn & Bảo mật</span>
                                                </div>
                                            </div>

                                            <a 
                                                href="/chinh-sach-va-dieu-khoan"  // <-- Đổi link trang chính sách của bạn ở đây
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors group"
                                            >
                                                <BookOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                                <span className="group-hover:underline underline-offset-2 decoration-blue-300">
                                                    Xem chính sách & điều khoản vé
                                                </span>
                                            </a>

                                        </div>

                                        <Button variant="outline" size="sm" className="gap-2" asChild>
                                            <Link href={`/flights/${flight.id}`}>
                                                <Info className="h-4 w-4" />
                                                Chi tiết chuyến bay
                                            </Link>
                                            </Button>
                                    </div>
                                </div>

                                {/* RIGHT: Price Selector */}
                                <div className="lg:w-2/5 p-6 bg-gradient-to-b from-gray-50/50 to-white">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Award className="h-4 w-4 text-blue-500" />
                                            Chọn hạng vé
                                        </h4>
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
                            </div>

                            {/* Expanded Section */}
                            {expandedFlight === index && ["economy", "premium", "business"].includes(expandedClass) && (
                                <div className="p-6 bg-gradient-to-b from-blue-50/30 to-white border-t border-blue-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                <div className={cn(
                                                    "w-3 h-8 rounded-full",
                                                    expandedClass === "economy" ? "bg-blue-500" :
                                                    expandedClass === "premium" ? "bg-purple-500" : "bg-amber-500"
                                                )}></div>
                                                Hạng {getClassLabel(expandedClass)}
                                            </h3>
                                            <p className="text-gray-600 mt-1">Lựa chọn phù hợp nhất cho hành trình của bạn</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">Giá mỗi hành khách</div>
                                            <div className="text-2xl font-bold text-blue-700">
                                                {getClassPrice(expandedClass) > 0 
                                                    ? `${getClassPrice(expandedClass).toLocaleString()} ₫`
                                                    : "Liên hệ"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {getClassOptions(expandedClass).map((option, optionIndex) => (
                                            <div key={optionIndex} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-bold text-gray-900">{option.name}</span>
                                                        <Check className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <BenefitItem
                                                            Icon={RefreshCw}
                                                            title="Đổi lịch bay"
                                                            value={option.changeFee > 0 ? `Phí ${option.changeFee.toLocaleString()} ₫` : "Miễn phí đổi"}
                                                            positive={option.changeFee === 0}
                                                        />
                                                        <BenefitItem
                                                            Icon={Luggage}
                                                            title="Hành lý ký gửi"
                                                            value={option.checkedBaggage}
                                                            positive={true}
                                                        />
                                                        <BenefitItem
                                                            Icon={Luggage}
                                                            title="Hành lý xách tay"
                                                            value={option.carryOn}
                                                            positive={true}
                                                        />
                                                        <BenefitItem
                                                            Icon={X}
                                                            title="Hoàn vé"
                                                            value={option.refundFee > 0 ? `Phí ${option.refundFee.toLocaleString()} ₫` : "Không hoàn vé"}
                                                            positive={option.refundFee === 0}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                                                    <span className="font-semibold">Chọn vé {getClassLabel(expandedClass)}</span>
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Giá đã bao gồm thuế và phí.</span>
                                            {" "}Không phát sinh thêm chi phí ẩn.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}