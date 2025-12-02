import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, PlaneTakeoff, PlaneLanding, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper: chuẩn hoá chuỗi thời gian từ backend sang format cho input datetime-local
// Đầu vào có thể là:
//  - "YYYY-MM-DDTHH:mm:ss" (LocalDateTime từ backend)
//  - "YYYY-MM-DD HH:mm:ss" (fallback cũ)
// Đầu ra: "YYYY-MM-DDTHH:mm"
const formatISODateToLocal = (value) => {
    if (!value) return '';
    try {
        let str = value.toString();
        // Đảm bảo dùng ký tự 'T' giữa ngày và giờ
        if (str.includes(' ')) {
            str = str.replace(' ', 'T');
        }
        // Cắt tới phút: YYYY-MM-DDTHH:mm
        if (str.length >= 16) {
            return str.slice(0, 16);
        }
        return str;
    } catch {
        return '';
    }
};


export function EditFlightDialog({ flight, onClose, onSave }) {
    // 1. Khởi tạo state với giá trị ban đầu đã được format cho input type="datetime-local"
    // Sử dụng field names từ backend: departureTime, arrivalTime
    const initialDepartureTime = useMemo(() => formatISODateToLocal(flight.departureTime || flight.ddt), [flight.departureTime, flight.ddt]);
    const initialArrivalTime = useMemo(() => formatISODateToLocal(flight.arrivalTime || flight.adt), [flight.arrivalTime, flight.adt]);

    const [editedFlight, setEditedFlight] = useState({
        ...flight,
        departureTimeLocal: initialDepartureTime,
        arrivalTimeLocal: initialArrivalTime,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleFieldChange = (field) => (e) => {
        const { value } = e.target;
        setEditedFlight(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Sử dụng scheduleId từ backend (không phải flightId)
        const flightId = flight.scheduleId || flight.flightId;
        const editFlightApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flight/${flightId}`;

        // Chuyển datetime-local string (YYYY-MM-DDTHH:mm) sang LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
        const apiBody = {
            flightNumber: flight.flightNumber,
            aircraftType: flight.aircraftType,
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
            departureAirport: flight.departureAirportCode || flight.departureAirport,
            arrivalAirport: flight.arrivalAirportCode || flight.arrivalAirport,
            departureTime: editedFlight.departureTimeLocal ? `${editedFlight.departureTimeLocal}:00` : null,
            arrivalTime: editedFlight.arrivalTimeLocal ? `${editedFlight.arrivalTimeLocal}:00` : null,
            basePrice: flight.basePrice,
            status: flight.status
        };

        try {
            const response = await fetch(editFlightApi, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "admin": "true",
                    "authorization": "Bearer " + localStorage.getItem("token")
                }, 
                body: JSON.stringify(apiBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Lỗi server không xác định.' }));
                throw new Error(errorData.message || "failed");
            }

            onSave(editedFlight);
        } catch (error) {
            alert(`Lỗi khi cập nhật chuyến bay: ${error.message || "Vui lòng kiểm tra kết nối."}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-xl shadow-2xl p-6 bg-white">
                <DialogHeader className="border-b pb-3 mb-4">
                    <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <PlaneTakeoff className="h-6 w-6 text-primary" />
                        {`Chỉnh sửa chuyến bay ${flight.flightNumber || flight.id}`}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Chỉ cho phép thay đổi thời gian khởi hành và hạ cánh.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        {/* Current Route Display */}
                        <div className="bg-muted p-3 rounded-lg flex justify-between text-sm font-semibold text-foreground">
                            <span>Từ: {flight.departureAirportCode || flight.src} ({flight.departureCity || ''})</span>
                            <span>Đến: {flight.arrivalAirportCode || flight.dest} ({flight.arrivalCity || ''})</span>
                        </div>

                        {/* Departure Time */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="departureTimeLocal" className="text-left md:text-right font-semibold text-gray-700 flex items-center gap-1">
                                <PlaneTakeoff className="h-4 w-4 text-primary" /> Khởi hành
                            </Label>
                            <Input
                                id="departureTimeLocal"
                                name="departureTimeLocal"
                                type="datetime-local"
                                value={editedFlight.departureTimeLocal}
                                onChange={handleFieldChange('departureTimeLocal')}
                                required
                                className="col-span-3 border-2 border-border focus:border-primary transition-colors h-10"
                            />
                        </div>

                        {/* Arrival Time */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="arrivalTimeLocal" className="text-left md:text-right font-semibold text-gray-700 flex items-center gap-1">
                                <PlaneLanding className="h-4 w-4 text-primary" /> Hạ cánh
                            </Label>
                            <Input
                                id="arrivalTimeLocal"
                                name="arrivalTimeLocal"
                                type="datetime-local"
                                value={editedFlight.arrivalTimeLocal}
                                onChange={handleFieldChange('arrivalTimeLocal')}
                                required
                                className="col-span-3 border-2 border-border focus:border-primary transition-colors h-10"
                            />
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-md" disabled={isSaving}>
                            <Save className={cn("h-4 w-4 mr-2", isSaving ? 'animate-spin' : '')} />
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}