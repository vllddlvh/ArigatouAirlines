'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sun, CloudSun, Sunset, Moon, Filter, RotateCw, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils"; // Giả định utility cn có sẵn

/**
 * Component Filter: Dùng để chọn khoảng ngân sách và giờ khởi hành.
 * Nhận vào `filters` (state từ useFlightData) và `setFilters` (để cập nhật filters).
 */
export function FlightSideFilter({ filters, setFilters }) {
  // Giá trị mặc định (Nên được truyền từ prop hoặc định nghĩa rõ ràng)
  const defaultMinBudget = 0;
  const defaultMaxBudget = 1000000000;
  const defaultBudgetRange = [defaultMinBudget, defaultMaxBudget];
  const defaultDepartureTime = "all";

  const [localBudget, setLocalBudget] = useState(filters.budget || defaultBudgetRange);
  const [localDepartureTime, setLocalDepartureTime] = useState(filters.departureTime || defaultDepartureTime);

  // Hàm áp dụng bộ lọc (khi click "Áp dụng")
  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      budget: localBudget,
      departureTime: localDepartureTime,
    }));
  };

  // Hàm thiết lập lại filter về giá trị mặc định
  const handleResetFilters = () => {
    setLocalBudget(defaultBudgetRange);
    setLocalDepartureTime(defaultDepartureTime);
    setFilters({
      budget: defaultBudgetRange,
      departureTime: defaultDepartureTime,
    });
  };

  // Định nghĩa các lựa chọn giờ khởi hành chi tiết hơn
  const timeOptions = useMemo(() => [
    { value: "all", label: "Tất cả", icon: Filter, timeRange: "Mọi lúc" },
    { value: "morning", label: "Buổi sáng", icon: Sun, timeRange: "05:00 - 11:59" },
    { value: "afternoon", label: "Buổi chiều", icon: CloudSun, timeRange: "12:00 - 17:59" },
    { value: "evening", label: "Buổi tối", icon: Sunset, timeRange: "18:00 - 23:59" },
    { value: "night", label: "Đêm muộn", icon: Moon, timeRange: "00:00 - 04:59" },
  ], []);

  const isFilterChanged = 
    (localBudget[0] !== filters.budget?.[0] || localBudget?.[1] !== filters.budget?.[1]) ||
    (localDepartureTime !== filters.departureTime);

  return (
    <Card className="w-full shadow-2xl border-t-4 border-blue-500 transition-all duration-300 hover:shadow-blue-300/50">
      <CardHeader className="p-4 border-b">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
          <Filter className="h-6 w-6 text-blue-500" /> Bộ Lọc Chuyến Bay
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* 1. Bộ lọc ngân sách (Price Range Slider) */}
          <div className="lg:w-1/3 space-y-4 p-4 border rounded-lg shadow-sm">
            <Label className="text-lg font-semibold text-gray-700 block mb-3">
                Ngân sách (Giá vé)
            </Label>
            
            <div className="flex justify-between text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded">
              <span>{localBudget?.[0].toLocaleString('vi-VN')} VND</span>
              <span>{localBudget?.[1].toLocaleString('vi-VN')} VND</span>
            </div>
            
            <Slider
              min={defaultMinBudget}
              max={defaultMaxBudget}
              step={1000}
              value={localBudget}
              onValueChange={setLocalBudget}
              className="mt-4"
            />
            
            <p className="text-xs text-gray-500 pt-2">
                Khoảng giá có sẵn: {defaultMinBudget.toLocaleString('vi-VN')} VND - {defaultMaxBudget.toLocaleString('vi-VN')} VND
            </p>
          </div>

          {/* 2. Bộ lọc giờ khởi hành (Visual Radio Group) */}
          <div className="lg:w-1/3 space-y-4 p-4 border rounded-lg shadow-sm">
            <Label className="text-lg font-semibold text-gray-700 block mb-3">
                Giờ Khởi Hành
            </Label>
            
            <RadioGroup
              value={localDepartureTime}
              onValueChange={setLocalDepartureTime}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            >
              {timeOptions.map((option) => (
                <TimeOptionItem 
                    key={option.value}
                    option={option}
                    currentValue={localDepartureTime}
                />
              ))}
            </RadioGroup>
          </div>

          {/* 3. Nút thao tác (Apply/Reset) */}
          <div className="lg:w-1/3 flex flex-col justify-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="text-center text-sm font-medium text-gray-600 mb-2">
                {isFilterChanged ? "Đã thay đổi bộ lọc. Áp dụng ngay!" : "Bộ lọc đang được áp dụng."}
            </div>
            <Button 
                variant="orange"
                onClick={handleApplyFilters}
                disabled={!isFilterChanged}
                className="w-full py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Áp Dụng Bộ Lọc
            </Button>
            
            <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="w-full py-6 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <RotateCw className="h-4 w-4 mr-2" /> Thiết Lập Lại
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component con cho từng lựa chọn giờ khởi hành
function TimeOptionItem({ option, currentValue }) {
    const isSelected = option.value === currentValue;
    const baseColor = option.value === "all" ? "gray" : "blue";
    
    const iconColorClass = isSelected ? "text-white" : `text-${baseColor}-500`;

    return (
        <Label 
            htmlFor={option.value} 
            className={cn(
                "flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200",
                isSelected 
                    ? `bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]` 
                    : `bg-white border-gray-200 hover:bg-gray-50 text-gray-700`
            )}
        >
            <RadioGroupItem 
                value={option.value} 
                id={option.value} 
                className="sr-only" 
            />
            <option.icon className={cn("h-6 w-6 mb-1", iconColorClass)} />
            <span className="font-semibold text-sm text-center">
                {option.label}
            </span>
            <span className={cn("text-xs mt-0.5", isSelected ? "text-blue-200" : "text-gray-500")}>
                {option.timeRange}
            </span>
        </Label>
    );
}