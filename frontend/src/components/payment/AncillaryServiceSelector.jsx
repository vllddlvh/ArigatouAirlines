'use client';

import React, { useEffect, useState } from 'react';
import { PackagePlus, Luggage, Utensils, Wifi, Check, Square } from 'lucide-react'; // Import Check, Square
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllAncillaryServices } from '@/services/ancillaryService';
import { Skeleton } from "@/components/ui/skeleton";

const getServiceIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('hành lý') || lowerName.includes('baggage')) return <Luggage className="w-5 h-5" />;
    if (lowerName.includes('ăn') || lowerName.includes('meal')) return <Utensils className="w-5 h-5" />;
    if (lowerName.includes('mạng') || lowerName.includes('wifi')) return <Wifi className="w-5 h-5" />;
    return <PackagePlus className="w-5 h-5" />;
};

export default function AncillaryServiceSelector({ selectedServices = [], onToggleService }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getAllAncillaryServices();
                setServices(Array.isArray(data) ? data : (data.content || []));
            } catch (error) {
                console.error("Failed to load services", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return (
            <Card className="shadow-sm border-orange-100 mt-6">
                <CardHeader>
                   <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (services.length === 0) return null;

    return (
        <Card className="shadow-sm border-orange-100 mt-6 animate-in fade-in slide-in-from-bottom-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-800">
                    <PackagePlus className="w-5 h-5 text-orange-500" />
                    Dịch vụ bổ sung (Có thể chọn nhiều)
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {services.map((service) => {
                    // Kiểm tra xem dịch vụ này đã được chọn chưa
                    const isSelected = selectedServices.some(s => s.serviceName === service.serviceName);
                    
                    return (
                        <div 
                            key={service.id}
                            onClick={() => onToggleService(service)}
                            className={`
                                relative flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 group select-none
                                ${isSelected 
                                    ? 'border-orange-500 bg-orange-50/50 shadow-sm' 
                                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Checkbox Icon Visual */}
                                <div className={`transition-colors ${isSelected ? 'text-orange-600' : 'text-gray-300 group-hover:text-orange-400'}`}>
                                    {isSelected ? <Check className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>

                                <div className={`p-2 rounded-full ${isSelected ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {getServiceIcon(service.name)}
                                </div>
                                <div>
                                    <p className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                        {service.name}
                                    </p>
                                    {service.description && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <span className={`font-bold block ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                                    +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}