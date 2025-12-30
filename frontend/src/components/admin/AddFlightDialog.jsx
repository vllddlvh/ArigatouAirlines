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
    const [ticketClasses, setTicketClasses] = useState([])

    // Chỉ cần nhập giá Economy, hệ thống tự tính Premium x1.5, Business x2
    const [economyBasePrice, setEconomyBasePrice] = useState('')
    const [economyTax, setEconomyTax] = useState('0')

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

    const readResponseBody = async (res) => {
        const text = await res.text()
        if (!text) return null
        try {
            return JSON.parse(text)
        } catch (e) {
            return { message: text }
        }
    }

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

            const [resAirlines, resAirports, resAircrafts, resTicketClasses] = await Promise.all([
                fetch(`${API_BASE_URL}/airline`, { headers }),
                fetch(`${API_BASE_URL}/airport`, { headers }),
                fetch(`${API_BASE_URL}/aircraft`, { headers }),
                fetch(`${API_BASE_URL}/ticketClass`, { headers }),
            ])

            const dataAirlines = await resAirlines.json()
            const dataAirports = await resAirports.json()
            const dataAircrafts = await resAircrafts.json()
            const dataTicketClasses = await resTicketClasses.json()

            setAirlines(dataAirlines.body || [])
            setAirports(dataAirports.body || [])
            setAircrafts(dataAircrafts.body || [])
            const classes = dataTicketClasses.body || []
            setTicketClasses(classes)
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

        // Validate giá Economy
        if (!economyBasePrice || String(economyBasePrice).trim() === '' || Number(economyBasePrice) <= 0) {
            alert("Vui lòng nhập giá cơ bản cho hạng Economy.")
            return
        }

        setIsSubmitting(true)
        const token = localStorage.getItem("token")

        let createdScheduleId = null
        let createdFlightId = null

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

            const scheduleData = await readResponseBody(scheduleRes)
            if (!scheduleRes.ok) {
                const rawMsg = scheduleData?.message || "Lỗi khi tạo lịch trình"
                if (String(rawMsg).includes("Duplicate entry") || String(rawMsg).includes("flight_schedule.flight_number")) {
                    throw new Error("Số hiệu chuyến bay đã tồn tại. Vui lòng nhập số hiệu khác.")
                }
                throw new Error(rawMsg)
            }

            const scheduleId = scheduleData?.body?.scheduleId
            if (!scheduleId) {
                throw new Error("Không lấy được scheduleId sau khi tạo lịch trình")
            }
            createdScheduleId = scheduleId


            // BƯỚC 2: Tạo Flight 
            const flightPayload = {
                scheduleId: scheduleId, 
                aircraftId: parseInt(formData.aircraftId),
                departureTime: `${formData.departureTime}:00`,
                flightDate: formData.flightDate,
            }



            const flightRes = await fetch(`${API_BASE_URL}/flights`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(flightPayload)
            })

            const flightData = await readResponseBody(flightRes);
            if (!flightRes.ok) {
                console.error("Backend error:", flightData);
                throw new Error(flightData.message || "Lỗi khi tạo chuyến bay");
            }

            const flightId = flightData?.body?.flightId
            if (!flightId) {
                throw new Error("Không lấy được flightId sau khi tạo chuyến bay")
            }

            createdFlightId = flightId

            const selectedAircraft = aircrafts.find(ac => String(ac?.aircraftId) === String(formData.aircraftId))
            const seatMapList = selectedAircraft?.aircraftType?.listSeatMap || []

            // Tính số ghế theo từng SeatClass từ seatMap
            const normalize = (v) => String(v ?? "").toUpperCase()
            const seatCountBySeatClass = {}
            seatMapList.forEach(s => {
                if (s && s.seatClass) {
                    const sc = normalize(s.seatClass)
                    seatCountBySeatClass[sc] = (seatCountBySeatClass[sc] || 0) + 1
                }
            })

            // Mapping TicketClass.className -> SeatClass -> số ghế
            // ECONOMY -> ECONOMY, PREMIUM_ECONOMY -> PREMIUM_ECONOMY, BUSINESS -> BUSINESS_PREMIER
            const getSeatCountForTicketClass = (className) => {
                const cn = normalize(className)
                if (cn === 'BUSINESS') return seatCountBySeatClass['BUSINESS_PREMIER'] || 0
                if (cn === 'PREMIUM_ECONOMY' || cn === 'PREMIUM') return seatCountBySeatClass['PREMIUM_ECONOMY'] || 0
                return seatCountBySeatClass['ECONOMY'] || 0
            }

            // Tính giá theo tỷ lệ: Economy x1, Premium x1.5, Business x2
            const getPriceMultiplier = (className) => {
                const cn = normalize(className)
                if (cn === 'BUSINESS') return 2.0
                if (cn === 'PREMIUM_ECONOMY' || cn === 'PREMIUM') return 1.5
                return 1.0
            }

            const baseEconomyPrice = Number(economyBasePrice)
            const baseTax = Number(economyTax || 0)

            // Tạo FlightPrice cho tất cả TicketClass có trong hệ thống
            for (const tc of ticketClasses) {
                if (!tc?.classId) continue
                const seats = getSeatCountForTicketClass(tc.className)
                const multiplier = getPriceMultiplier(tc.className)
                const flightPricePayload = {
                    flightId: Number(createdFlightId),
                    ticketClassId: Number(tc.classId),
                    basePrice: Math.round(baseEconomyPrice * multiplier),
                    tax: Math.round(baseTax * multiplier),
                    totalSeats: seats,
                    availableSeats: seats,
                }

                const flightPriceRes = await fetch(`${API_BASE_URL}/flightPrice`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(flightPricePayload)
                })

                const flightPriceData = await readResponseBody(flightPriceRes)
                if (!flightPriceRes.ok) {
                    console.error("Backend error (flightPrice):", flightPriceData)
                    throw new Error(flightPriceData.message || "Lỗi khi tạo giá vé")
                }
            }


            toast({ title: "Thành công", description: `Đã tạo chuyến bay ${formData.flightNumber}` })
            setIsOpen(false)
            window.location.reload()

        } catch (error) {
            if (createdFlightId || createdScheduleId) {
                try {
                    if (createdFlightId) {
                        await fetch(`${API_BASE_URL}/flights/${createdFlightId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` },
                        })
                    }
                    if (createdScheduleId) {
                        await fetch(`${API_BASE_URL}/flightSchedules/${createdScheduleId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` },
                        })
                    }
                } catch (rollbackError) {
                    console.error("Rollback failed:", rollbackError)
                }
            }
            toast({ variant: "destructive", title: "Thất bại", description: error?.message || "Có lỗi xảy ra" })
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
                                <Input
                                    placeholder="VN123"
                                    value={formData.flightNumber}
                                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hãng hàng không</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, airlineId: val })} required>
                                    <SelectTrigger><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
                                    <SelectContent>
                                        {airlines.filter(a => a?.airlineId).map((a) => (
                                            <SelectItem key={a.airlineId} value={a.airlineId.toString()}>{a.airlineCode}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Label className="font-bold text-blue-800">Giá vé hạng Economy (Phổ thông)</Label>
                            <p className="text-xs text-blue-600 mb-2">
                                Hệ thống sẽ tự động tính giá các hạng khác: Premium Economy (x1.5), Business (x2)
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Giá cơ bản (VND)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="VD: 1200000"
                                        value={economyBasePrice}
                                        onChange={(e) => setEconomyBasePrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Thuế/Phí (VND)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="VD: 0"
                                        value={economyTax}
                                        onChange={(e) => setEconomyTax(e.target.value)}
                                    />
                                </div>
                            </div>
                            {economyBasePrice && Number(economyBasePrice) > 0 && (
                                <div className="mt-3 p-2 bg-white rounded border text-xs">
                                    <div className="font-semibold mb-1">Giá tự động tính:</div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-1 bg-yellow-100 rounded">
                                            <div className="font-bold text-yellow-800">Economy</div>
                                            <div>{Number(economyBasePrice).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                        <div className="p-1 bg-blue-100 rounded">
                                            <div className="font-bold text-blue-800">Premium</div>
                                            <div>{Math.round(Number(economyBasePrice) * 1.5).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                        <div className="p-1 bg-amber-100 rounded">
                                            <div className="font-bold text-amber-800">Business</div>
                                            <div>{Math.round(Number(economyBasePrice) * 2).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Tuyến đường */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                            <div className="space-y-2">
                                <Label>Sân bay đi</Label>
                                <Select onValueChange={(val) => setFormData({...formData, departureAirportId: val})} required>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Điểm đi" /></SelectTrigger>
                                    <SelectContent>
                                        {airports.filter(ap => ap?.airportCode).map((ap) => (
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
                                        {airports.filter(ap => ap?.airportCode).map((ap) => (
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
                                        aircrafts.filter(ac => ac?.aircraftId).map((ac) => (
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