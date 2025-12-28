'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Plus, Plane, Hash, Anchor, Clock, CalendarDays, Loader2, PocketBase } from 'lucide-react' 
import { API_BASE_URL } from '@/lib/api'
import { cn } from "@/lib/utils"

export function AddFlightDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dữ liệu từ API
    const [airlines, setAirlines] = useState([])
    const [airports, setAirports] = useState([])
    const [aircrafts, setAircrafts] = useState([])

    const [formData, setFormData] = useState({
        flightNumber: '',
        airlineId: '',
        departureAirportId: '',
        arrivalAirportId: '',
        departureTime: '',
        arrivalTime: '',
        flightDate: '',
        aircraftId: '',
    })

    useEffect(() => {
        if (isOpen) {
            fetchInitialData()
        }
    }, [isOpen])

    const fetchInitialData = async () => {
        setIsLoadingData(true)
        try {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [resAirlines, resAirports, resAircrafts] = await Promise.all([
                fetch(`${API_BASE_URL}/airline`, { headers }),
                fetch(`${API_BASE_URL}/airport`, { headers }),
                fetch(`${API_BASE_URL}/aircraft`, { headers }) // Giả định endpoint là /aircraft
            ])

            const dataAirlines = await resAirlines.json()
            const dataAirports = await resAirports.json()
            const dataAircrafts = await resAircrafts.json()

            setAirlines(dataAirlines.body || [])
            setAirports(dataAirports.body || [])
            setAircrafts(dataAircrafts.body || [])
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error)
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách dữ liệu vận hành" })
        } finally {
            setIsLoadingData(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.departureAirportId === formData.arrivalAirportId) {
            alert("Sân bay đi và sân bay đến không được trùng nhau!")
            return
        }

        setIsSubmitting(true)
        const token = localStorage.getItem("token")

        try {
            // BƯỚC 1: Tạo Flight Schedule
            const schedulePayload = {
                flightNumber: formData.flightNumber,
                airlineId: parseInt(formData.airlineId),
                departureAirportId: formData.departureAirportId, 
                arrivalAirportId: formData.arrivalAirportId,     
                departureTime: `${formData.departureTime}:00`,
                arrivalTime: `${formData.arrivalTime}:00`,
                active: true
            }

            const scheduleRes = await fetch(`${API_BASE_URL}/flightSchedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(schedulePayload)
            })

            const scheduleData = await scheduleRes.json()
            if (!scheduleRes.ok) throw new Error(scheduleData.message || "Lỗi khi tạo lịch trình")

            const scheduleId = scheduleData.body.scheduleId


            // BƯỚC 2: Tạo Flight 
            const flightPayload = {
                scheduleId: scheduleId, 
                aircraftId: parseInt(formData.aircraftId),
                departureDate: formData.departureTime, 
                flightDate:formData.flightDate,
            }



            const flightRes = await fetch(`${API_BASE_URL}/flights`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(flightPayload)
            })


            if (!flightRes.ok) {
                const errorRes = await flightRes.json();

                console.error("Backend error:", errorRes);

                throw new Error(errorRes.message);
            }


            toast({ title: "Thành công", description: `Đã tạo chuyến bay ${formData.flightNumber}` })
            setIsOpen(false)
            window.location.reload()

        } catch (error) {
            alert(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> THÊM CHUYẾN BAY
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Plane className="h-6 w-6 text-primary" /> Đăng Ký Chuyến Bay
                    </DialogTitle>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        
                        {/* 1. Thông tin hãng và số hiệu */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Số hiệu chuyến</Label>
                                <Input placeholder="VN123" value={formData.flightNumber} onChange={(e) => setFormData({...formData, flightNumber: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Hãng hàng không</Label>
                                <Select onValueChange={(val) => setFormData({...formData, airlineId: val})} required>
                                    <SelectTrigger><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
                                    <SelectContent>
                                        {airlines.map((a) => (
                                            <SelectItem key={a.airlineId} value={a.airlineId.toString()}>{a.airlineCode}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 2. Tuyến đường */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                            <div className="space-y-2">
                                <Label>Sân bay đi</Label>
                                <Select onValueChange={(val) => setFormData({...formData, departureAirportId: val})} required>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Điểm đi" /></SelectTrigger>
                                    <SelectContent>
                                        {airports.map((ap) => (
                                            <SelectItem key={ap.airportCode} value={ap.airportCode}>{ap.airportCode} - {ap.city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sân bay đến</Label>
                                <Select onValueChange={(val) => setFormData({...formData, arrivalAirportId: val})} required>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Điểm đến" /></SelectTrigger>
                                    <SelectContent>
                                        {airports.map((ap) => (
                                            <SelectItem key={ap.airportCode} value={ap.airportCode}>{ap.airportCode} - {ap.city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 3. TÀU BAY (MỚI) */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold text-primary">
                                <Plane className="h-4 w-4" /> Chỉ định Tàu bay (Aircraft)
                            </Label>
                            <Select 
                                onValueChange={(val) => setFormData({...formData, aircraftId: val})} 
                                required
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Chọn tàu bay vận hành" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aircrafts.length > 0 ? (
                                        aircrafts.map((ac) => (
                                            <SelectItem key={ac.aircraftId} value={ac.aircraftId.toString()}>
                                                <div className="flex flex-col items-start py-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-base">{ac.registrationNumber}</span>
                                                        <span className={cn(
                                                            "text-[10px] px-2 py-0.5 rounded-full border",
                                                            ac.statusAircraft === 'AVAILABLE' ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                                                        )}>
                                                            {ac.statusAircraft}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        Loại: {ac.aircraftType?.typeName} ({ac.aircraftType?.manufacturer}) 
                                                        {ac.airline && ` • Hãng: ${ac.airline.airlineCode}`}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            Không tìm thấy tàu bay khả dụng
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 4. Thời gian */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Giờ cất cánh</Label>
                                <Input type="time" onChange={(e) => setFormData({...formData, departureTime: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Giờ hạ cánh</Label>
                                <Input type="time" onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} required />
                            </div>
                        </div>

                        {/* 5. Ngày vận hành */}
                        <div className="space-y-2">
                            <Label>Ngày khởi hành</Label>
                            <Input type="date" onChange={(e) => setFormData({...formData, flightDate: e.target.value})} required />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-11">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                                XÁC NHẬN TẠO CHUYẾN BAY
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}