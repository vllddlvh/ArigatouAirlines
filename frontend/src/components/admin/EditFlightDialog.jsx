'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Save, Hash, Anchor, Loader2, Plane } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import { toast } from "@/hooks/use-toast"

export function EditFlightDialog({ flight, onClose, onSave }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [airlines, setAirlines] = useState([]);
    const [airports, setAirports] = useState([]);

    // 1. Truy cập sâu vào object 'schedule' để lấy dữ liệu ban đầu
    const currentSchedule = flight?.schedule || {};

    const [formData, setFormData] = useState({
        flightNumber: currentSchedule.flightNumber || '',
        airlineId: currentSchedule.airline?.airlineId?.toString() || '',
        departureAirportId: currentSchedule.departureAirport?.airportCode || '',
        arrivalAirportId: currentSchedule.arrivalAirport?.airportCode || '',
        // Format LocalTime "16:51:00" -> "16:51" cho input time
        departureTime: currentSchedule.departureTime ? currentSchedule.departureTime.substring(0, 5) : '',
        arrivalTime: currentSchedule.arrivalTime ? currentSchedule.arrivalTime.substring(0, 5) : '',
        active: currentSchedule.active ?? true
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };
                const [resAirlines, resAirports] = await Promise.all([
                    fetch(`${API_BASE_URL}/airline`, { headers }),
                    fetch(`${API_BASE_URL}/airport`, { headers })
                ]);
                const dataAirlines = await resAirlines.json();
                const dataAirports = await resAirports.json();
                setAirlines(dataAirlines.body || []);
                setAirports(dataAirports.body || []);
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem("token");
        const scheduleId = currentSchedule.scheduleId; 

        try {
            const payload = {
                flightNumber: formData.flightNumber,
                airlineId: parseInt(formData.airlineId),
                departureAirportId: formData.departureAirportId,
                arrivalAirportId: formData.arrivalAirportId,
                departureTime: `${formData.departureTime}:00`,
                arrivalTime: `${formData.arrivalTime}:00`,
                active: formData.active
            };

            console.log(scheduleId)

            const response = await fetch(`${API_BASE_URL}/flightSchedules/${scheduleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Cập nhật thất bại");

            toast({ title: "Thành công", description: "Đã cập nhật lịch trình bay." });
            
            // Callback để update lại danh sách ở component cha
            onSave(result.body);
            onClose();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary text-xl font-bold">
                        <Plane className="h-6 w-6" />
                        Chỉnh sửa Lịch trình {formData.flightNumber}
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin gốc cho mã lịch trình #{currentSchedule.scheduleId}
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-2">
                        {/* Hàng 1: Số hiệu & Hãng */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium">Số hiệu chuyến</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input 
                                        className="pl-9"
                                        value={formData.flightNumber}
                                        onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium">Hãng hàng không</Label>
                                <Select 
                                    value={formData.airlineId} 
                                    onValueChange={(val) => setFormData({...formData, airlineId: val})}
                                >
                                    <SelectTrigger><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
                                    <SelectContent>
                                        {airlines.map((a) => (
                                            <SelectItem key={a.airlineId} value={a.airlineId.toString()}>{a.airlineCode}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Hàng 2: Lộ trình */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="space-y-2">
                                <Label className="text-blue-600 flex items-center gap-2 font-semibold">
                                    <Anchor className="h-4 w-4" /> Sân bay đi
                                </Label>
                                <Select 
                                    value={formData.departureAirportId} 
                                    onValueChange={(val) => setFormData({...formData, departureAirportId: val})}
                                >
                                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {airports.map((ap) => (
                                            <SelectItem key={ap.airportCode} value={ap.airportCode}>
                                                {ap.airportCode} - {ap.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-orange-600 flex items-center gap-2 font-semibold">
                                    <Anchor className="h-4 w-4" /> Sân bay đến
                                </Label>
                                <Select 
                                    value={formData.arrivalAirportId} 
                                    onValueChange={(val) => setFormData({...formData, arrivalAirportId: val})}
                                >
                                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {airports.map((ap) => (
                                            <SelectItem key={ap.airportCode} value={ap.airportCode}>
                                                {ap.airportCode} - {ap.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Hàng 3: Thời gian */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Giờ cất cánh
                                </Label>
                                <Input 
                                    type="time" 
                                    value={formData.departureTime} 
                                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Giờ hạ cánh
                                </Label>
                                <Input 
                                    type="time" 
                                    value={formData.arrivalTime} 
                                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} 
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Hủy bỏ</Button>
                            <Button type="submit" disabled={isSaving} className="px-8 bg-primary hover:bg-primary/90">
                                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Cập nhật lịch trình
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}