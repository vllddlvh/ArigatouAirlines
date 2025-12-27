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
import { API_BASE_URL } from '@/lib/api'

// --- Helper Component for Input Row ---
const InputRow = ({ id, label, type = "text", icon: Icon, required, ...props }) => (
    <div className="flex flex-col space-y-1.5">
        <Label htmlFor={id} className="font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            {label}
        </Label>
        <Input
            id={id}
            type={type}
            required={required}
            className="border-2 border-border focus:border-primary transition-colors h-10"
            {...props}
        />
    </div>
);

export function AddFlightDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flightData, setFlightData] = useState({
        flightNumber: '',
        aircraftType: '',
        departureCity: '',
        arrivalCity: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: '',
        prices: {
            ECONOMY: '',
            BUSINESS: ''
        },
        status: 'Scheduled'
    })

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        
        // Handle price fields separately
        if (id === 'economyPrice' || id === 'businessPrice') {
            const priceType = id === 'economyPrice' ? 'ECONOMY' : 'BUSINESS';
            setFlightData(prev => ({
                ...prev,
                prices: {
                    ...prev.prices,
                    [priceType]: value
                }
            }));
        } else {
            setFlightData(prev => ({ ...prev, [id]: value }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const createFlightApi = `${API_BASE_URL}/api/flights`

        const toLocalDateTimeString = (value) => {
            if (!value) return value
            // datetime-local thường là YYYY-MM-DDTHH:mm
            if (typeof value === 'string' && value.length === 16) return `${value}:00`
            return value
        }

        const economyPrice = parseInt(flightData.prices?.ECONOMY, 10)
        const { prices, ...restFlightData } = flightData

        if (!Number.isFinite(economyPrice) || economyPrice <= 0) {
            setIsSubmitting(false)
            alert('Đã xảy ra lỗi: Giá hạng phổ thông phải là số > 0.')
            return
        }

        const formattedFlightData = {
            ...restFlightData,
            departureTime: toLocalDateTimeString(flightData.departureTime),
            arrivalTime: toLocalDateTimeString(flightData.arrivalTime),
            basePrice: economyPrice,
        }

        try {
            const response = await fetch(createFlightApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(formattedFlightData)
            })

            if (!response.ok) {
                const errorText = await response.text().catch(() => '')
                let message = 'Server responded with an error.'
                try {
                    const parsed = JSON.parse(errorText)
                    message = parsed?.message || parsed?.error || parsed?.body?.message || message
                } catch {
                    if (errorText) message = errorText
                }

                console.error('Create flight failed', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                })

                throw new Error(message)
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
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ví dụ: QA301"
                                />
                                <InputRow
                                    id="aircraftType" 
                                    label="Loại Tàu bay (Aircraft)" 
                                    icon={Plane}
                                    value={flightData.aircraftType}
                                    onChange={handleInputChange}
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
                                    <InputRow id="departureCity" label="Thành phố" icon={MapPin} value={flightData.departureCity} onChange={handleInputChange} required />
                                    <InputRow id="departureAirport" label="Sân bay (Mã IATA)" icon={Anchor} value={flightData.departureAirport} onChange={handleInputChange} required />
                                </div>
                                {/* Arrival */}
                                <div className="space-y-3 pl-4">
                                    <h4 className="text-md font-semibold text-primary flex items-center gap-2"><ArrowRight className="h-4 w-4 rotate-180" /> ĐIỂM ĐẾN</h4>
                                    <InputRow id="arrivalCity" label="Thành phố" icon={MapPin} value={flightData.arrivalCity} onChange={handleInputChange} required />
                                    <InputRow id="arrivalAirport" label="Sân bay (Mã IATA)" icon={Anchor} value={flightData.arrivalAirport} onChange={handleInputChange} required />
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
                                    onChange={handleInputChange}
                                    required
                                />
                                <InputRow 
                                    id="arrivalTime" 
                                    label="Thời gian HẠ CÁNH" 
                                    icon={Clock}
                                    type="datetime-local" 
                                    value={flightData.arrivalTime}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputRow 
                                        id="economyPrice" 
                                        label="Giá Hạng Phổ Thông (VND)" 
                                        icon={DollarSign}
                                        type="number"
                                        value={flightData.prices.ECONOMY}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="1000"
                                        placeholder="Nhập giá hạng phổ thông"
                                    />
                                    <InputRow 
                                        id="businessPrice" 
                                        label="Giá Hạng Thương Gia (VND)" 
                                        icon={DollarSign}
                                        type="number"
                                        value={flightData.prices.BUSINESS}
                                        onChange={handleInputChange}
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