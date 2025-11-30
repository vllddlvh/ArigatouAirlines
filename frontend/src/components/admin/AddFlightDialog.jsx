'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Plane, Hash, Anchor, DollarSign, Clock, MapPin, CalendarDays, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AddFlightDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flightData, setFlightData] = useState({
        flightNumber: '',
        aircraftType: '',
        departureCity: '',
        arrivalCity: '',
        departureAirport: '', // Thêm trường này từ logic gốc
        arrivalAirport: '',   // Thêm trường này từ logic gốc
        departureTime: '',
        arrivalTime: '',
        basePrice: '',
        status: 'Scheduled' // Đặt trạng thái mặc định hợp lý hơn
    })

    const handleFieldChange = (field) => (e) => {
        const { value } = e.target;
        setFlightData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const createFlightApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flight`
        const formattedFlightData = {
            ...flightData,
            departureTime: new Date(flightData.departureTime).toISOString(),
            arrivalTime: new Date(flightData.arrivalTime).toISOString(),
            basePrice: parseInt(flightData.basePrice, 10),
            // Loại bỏ status: 'On Time' vì không phải là giá trị enum hợp lệ, sử dụng 'Scheduled'
        };

        try {
            const response = await fetch(createFlightApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "admin": "true",
                    "authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(formattedFlightData)
            })

            if (!response.ok) {
                // Đọc thông báo lỗi nếu có
                const errorData = await response.json().catch(() => ({ message: 'Server responded with an error.' }));
                throw new Error(errorData.message || "failed");
            }

            toast({
                title: "Thành công!",
                description: `Chuyến bay ${flightData.flightNumber} đã được thêm thành công.`,
            })
            window.location.reload(); // Tải lại trang sau khi thành công

        } catch (error) {
            alert(`Đã xảy ra lỗi: ${error.message || "Vui lòng kiểm tra lại thông tin."}`);
            console.error(error);
        } finally {
            setIsSubmitting(false)
            setIsOpen(false)
        }
    }

    // --- Helper Component for Input Row ---
    const InputRow = ({ id, label, type = "text", icon: Icon, required, ...props }) => (
        <div className="flex flex-col space-y-1.5">
            <Label htmlFor={id} className="font-semibold text-gray-700 flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                {label}
            </Label>
            <Input
                id={id}
                name={id}
                type={type}
                required={required}
                className="border-2 border-border focus:border-primary transition-colors h-10"
                {...props}
            />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    THÊM CHUYẾN BAY MỚI
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]rounded-xl shadow-2xl p-6 bg-white max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Plane className="h-6 w-6 text-primary" />
                        Đăng Ký Chuyến Bay Mới
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Vui lòng nhập đầy đủ các thông tin vận hành cần thiết.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        
                        {/* 1. Thông tin Định danh & Tàu bay */}
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                            <h3 className="font-bold text-lg text-foreground mb-3">Thông tin Cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputRow 
                                    id="flightNumber" 
                                    label="Số hiệu Chuyến bay" 
                                    icon={Hash}
                                    value={flightData.flightNumber}
                                    onChange={handleFieldChange('flightNumber')}
                                    required
                                    placeholder="Ví dụ: QA301"
                                />
                                <InputRow 
                                    id="aircraftType" 
                                    label="Loại Tàu bay (Aircraft)" 
                                    icon={Plane}
                                    value={flightData.aircraftType}
                                    onChange={handleFieldChange('aircraftType')}
                                    required
                                    placeholder="Ví dụ: Boeing 787"
                                />
                            </div>
                        </div>

                        {/* 2. Thông tin Tuyến đường (Route) */}
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                            <h3 className="font-bold text-lg text-foreground mb-3">Tuyến đường (Route)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Departure */}
                                <div className="space-y-3 border-r pr-4 border-border">
                                    <h4 className="text-md font-semibold text-primary flex items-center gap-2"><ArrowRight className="h-4 w-4" /> ĐIỂM ĐI</h4>
                                    <InputRow id="departureCity" label="Thành phố" icon={MapPin} value={flightData.departureCity} onChange={handleFieldChange('departureCity')} required />
                                    <InputRow id="departureAirport" label="Sân bay (Mã IATA)" icon={Anchor} value={flightData.departureAirport} onChange={handleFieldChange('departureAirport')} required />
                                </div>
                                {/* Arrival */}
                                <div className="space-y-3 pl-4">
                                    <h4 className="text-md font-semibold text-primary flex items-center gap-2"><ArrowRight className="h-4 w-4 rotate-180" /> ĐIỂM ĐẾN</h4>
                                    <InputRow id="arrivalCity" label="Thành phố" icon={MapPin} value={flightData.arrivalCity} onChange={handleFieldChange('arrivalCity')} required />
                                    <InputRow id="arrivalAirport" label="Sân bay (Mã IATA)" icon={Anchor} value={flightData.arrivalAirport} onChange={handleFieldChange('arrivalAirport')} required />
                                </div>
                            </div>
                        </div>

                        {/* 3. Thời gian và Giá */}
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                            <h3 className="font-bold text-lg text-foreground mb-3">Thời gian & Giá</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputRow 
                                    id="departureTime" 
                                    label="Thời gian CẤT CÁNH" 
                                    icon={CalendarDays}
                                    type="datetime-local" 
                                    value={flightData.departureTime}
                                    onChange={handleFieldChange('departureTime')}
                                    required
                                />
                                <InputRow 
                                    id="arrivalTime" 
                                    label="Thời gian HẠ CÁNH" 
                                    icon={Clock}
                                    type="datetime-local" 
                                    value={flightData.arrivalTime}
                                    onChange={handleFieldChange('arrivalTime')}
                                    required
                                />
                                <div className="md:col-span-2">
                                    <InputRow 
                                        id="basePrice" 
                                        label="Giá Cơ sở (VND)" 
                                        icon={DollarSign}
                                        type="number" 
                                        step="1000"
                                        value={flightData.basePrice}
                                        onChange={handleFieldChange('basePrice')}
                                        required
                                        placeholder="Ví dụ: 1500000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                            Hủy bỏ
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                            disabled={isSubmitting}
                        >
                            <Plus className={cn("h-4 w-4 mr-2", isSubmitting ? 'animate-spin' : '')} />
                            {isSubmitting ? 'Đang tạo...' : 'Tạo Chuyến Bay'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}