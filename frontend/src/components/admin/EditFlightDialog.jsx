import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, PlaneTakeoff, PlaneLanding, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper function to format ISO date string for datetime-local input
// Required format: YYYY-MM-DDTHH:mm
const formatISODateToLocal = (isoString) => {
    if (!isoString) return '';
    try {
        // Assuming isoString comes in a format like "YYYY-MM-DD HH:mm:ss" or similar
        // We'll normalize it to a valid date object first
        const dateObj = new Date(isoString);

        if (isNaN(dateObj.getTime())) {
            // Fallback for custom date formats (like the one in the original component)
            // Trying to reconstruct a standard date string
            const [datePart, timePart] = isoString.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute] = timePart.split(':');

            // Construct the YYYY-MM-DDTHH:mm format
            return `${year}-${month}-${day}T${hour}:${minute}`;
        }

        // Standard way for ISO strings
        return dateObj.toISOString().slice(0, 16);
    } catch {
        return ''; // Return empty string on failure
    }
};


export function EditFlightDialog({ flight, onClose, onSave }) {
    // 1. Khởi tạo state với giá trị ban đầu đã được format cho input type="datetime-local"
    const initialDepartureTime = useMemo(() => formatISODateToLocal(flight.ddt), [flight.ddt]);
    const initialArrivalTime = useMemo(() => formatISODateToLocal(flight.adt), [flight.adt]);

    const [editedFlight, setEditedFlight] = useState({
        ...flight,
        departureTime: initialDepartureTime,
        arrivalTime: initialArrivalTime,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e) => {
        // Xử lý sự kiện input chuẩn
        const { name, value } = e.target;
        setEditedFlight(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const editFlightApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flight/update?id=${editedFlight.flightId}`;
        
        // Chuyển đổi datetime-local string sang Unix seconds (milliseconds / 1000)
        const departureSeconds = Date.parse(editedFlight.departureTime) / 1000;
        const arrivalSeconds = Date.parse(editedFlight.arrivalTime) / 1000;

        // Dữ liệu API (giữ nguyên logic gốc)
        const apiBody = JSON.stringify({
            "arrivalTime": {"seconds": arrivalSeconds},
            "departureTime": {"seconds": departureSeconds},
        });

        try {
            const response = await fetch(editFlightApi, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "admin": "true",
                    "authorization": "Bearer " + localStorage.getItem("token")
                }, 
                body: apiBody
            });

            if (!response.ok) {
                // Đọc thông báo lỗi từ server nếu có
                const errorData = await response.json().catch(() => ({ message: 'Lỗi server không xác định.' }));
                throw new Error(errorData.message || "failed");
            }

            // Cập nhật state gốc với dữ liệu đã format lại trước khi gọi onSave
            const updatedDisplayFlight = {
                ...editedFlight,
                // Chuyển đổi lại thành format string hiển thị nếu cần (đã được xử lý trong component cha)
                ddt: editedFlight.departureTime, 
                adt: editedFlight.arrivalTime
            };

            onSave(updatedDisplayFlight); // Gọi hàm lưu thành công (cũng sẽ đóng dialog)
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
                        {`Chỉnh sửa chuyến bay ${flight.id}`}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Chỉ cho phép thay đổi thời gian khởi hành và hạ cánh.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        {/* Current Route Display (Added for context) */}
                        <div className="bg-muted p-3 rounded-lg flex justify-between text-sm font-semibold text-foreground">
                            <span>Từ: {flight.src}</span>
                            <span>Đến: {flight.dest}</span>
                        </div>

                        {/* Departure Time */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="departureTime" className="text-left md:text-right font-semibold text-gray-700 flex items-center gap-1">
                                <PlaneTakeoff className="h-4 w-4 text-primary" /> Khởi hành
                            </Label>
                            <Input
                                id="departureTime"
                                name="departureTime"
                                type="datetime-local"
                                value={editedFlight.departureTime}
                                onChange={handleInputChange}
                                required
                                className="col-span-3 border-2 border-border focus:border-primary transition-colors h-10"
                            />
                        </div>

                        {/* Arrival Time */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="arrivalTime" className="text-left md:text-right font-semibold text-gray-700 flex items-center gap-1">
                                <PlaneLanding className="h-4 w-4 text-primary" /> Hạ cánh
                            </Label>
                            <Input
                                id="arrivalTime"
                                name="arrivalTime"
                                type="datetime-local"
                                value={editedFlight.arrivalTime}
                                onChange={handleInputChange}
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