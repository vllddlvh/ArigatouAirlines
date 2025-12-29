'use client';

import Image from "next/image";
import { User, Calendar, PlaneTakeoff, PlaneLanding, Repeat2, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Giả định utility cn có sẵn

export function FlightHeader({
  departureCode,
  arrivalCode,
  departureCity,
  arrivalCity,
  departureDate,
  returnDate,
  passengers,
}) {
  const isRoundTrip = !!returnDate;

  return (
    <>
      {/* 1. Hero Section - Tiêu đề Lớp phủ Động */}
      <div className="relative h-[300px] w-full mb-8">
        <Image
          src="/tours_background.jpg"
          alt="Hình nền chuyến bay cao cấp"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Thông tin Chính (Nằm ở góc dưới cùng) */}
        <div className="absolute inset-x-0 bottom-0 p-8 text-white max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-baseline gap-4">
            <div className="text-sm font-semibold uppercase tracking-widest text-orange-300">
                Tìm kiếm của bạn
            </div>
            {/* Nếu cần tiêu đề lớn */}
            {/* <h1 className="text-4xl font-extrabold mb-2">Khám Phá Thế Giới</h1> */}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-5xl font-extrabold drop-shadow-lg">
              {departureCity}
            </h2>
            <ArrowRight className="h-10 w-10 text-orange-400 drop-shadow-lg" />
            <h2 className="text-5xl font-extrabold drop-shadow-lg">
              {arrivalCity}
            </h2>
          </div>
          
        </div>
      </div>

      {/* 2. Flight Info Bar - Thanh Thông tin Sticky Cao cấp */}
      <div className="sticky top-0 bg-white shadow-xl z-40 transition-all duration-300 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            {/* A. Tuyến bay (Mã sân bay & Thành phố) */}
            <div className="flex items-center gap-4 border-r pr-6 border-gray-200">
              <PlaneTakeoff className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-900">
                  {departureCode} <span className="text-lg font-normal text-gray-500">→</span> {arrivalCode}
                </div>
                <div className="text-sm text-gray-600">
                  {departureCity} đến {arrivalCity}
                </div>
              </div>
            </div>

            {/* B. Chi tiết Ngày/Hành khách */}
            <div className="flex flex-wrap gap-8 md:gap-12">
              
              {/* Chuyến đi */}
              <InfoPill 
                Icon={Calendar} 
                label="Ngày khởi hành" 
                value={departureDate} 
                valueClass="text-gray-800"
              />
              
              {/* Chuyến về (Hiển thị tùy chọn) */}
              {isRoundTrip ? (
                <InfoPill 
                    Icon={Repeat2} 
                    label="Ngày trở về" 
                    value={returnDate} 
                    valueClass="text-gray-800"
                />
              ) : (
                <div className="opacity-50 text-gray-400 flex items-center gap-2">
                    <Repeat2 className="h-5 w-5" />
                    <div className="text-sm">Một chiều</div>
                </div>
              )}
              
              {/* Hành khách */}
              <InfoPill 
                Icon={Users} 
                label="Hành khách" 
                value={`${passengers} Người`} 
                valueClass="text-orange-600"
              />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component con cho các thông tin quan trọng
function InfoPill({ Icon, label, value, valueClass }) {
    return (
        <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gray-100 border border-gray-200">
                <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
                <div className="text-xs uppercase font-medium text-gray-500">{label}</div>
                <div className={cn("font-semibold text-base mt-0.5", valueClass)}>{value}</div>
            </div>
        </div>
    );
}