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
import { Plus, Plane, Loader2, DollarSign, Tag } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export function AddFlightDialog({ onSave }) { // Thêm prop onSave để reload list ở cha
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dữ liệu từ API
    const [airlines, setAirlines] = useState([])
    const [airports, setAirports] = useState([])
    const [aircrafts, setAircrafts] = useState([])
    const [ticketClasses, setTicketClasses] = useState([]) // MỚI: Danh sách hạng vé

    // Form dữ liệu chuyến bay
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

    // MỚI: Form cấu hình giá vé (Lưu theo ticketClassId)
    // Cấu trúc: { [classId]: { enabled: true, basePrice: 1000000, tax: 100000, seats: 50 } }
    const [priceConfig, setPriceConfig] = useState({})

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

            const [resAirlines, resAirports, resAircrafts, resTicketClass] = await Promise.all([
                fetch(`${API_BASE_URL}/airline`, { headers }),
                fetch(`${API_BASE_URL}/airport`, { headers }),
                fetch(`${API_BASE_URL}/aircraft`, { headers }),
                fetch(`${API_BASE_URL}/ticketClass`, { headers }) // MỚI: Fetch hạng vé
            ])

            const dataAirlines = await resAirlines.json()
            const dataAirports = await resAirports.json()
            const dataAircrafts = await resAircrafts.json()
            const dataTicketClass = await resTicketClass.json()

            setAirlines(dataAirlines.body || [])
            setAirports(dataAirports.body || [])
            setAircrafts(dataAircrafts.body || [])
            setTicketClasses(dataTicketClass.body || [])

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error)
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải dữ liệu hệ thống" })
        } finally {
            setIsLoadingData(false)
        }
    }

    // MỚI: Hàm xử lý thay đổi input giá vé
    const handlePriceChange = (classId, field, value) => {
        setPriceConfig(prev => ({
            ...prev,
            [classId]: {
                ...prev[classId],
                [field]: value
            }
        }))
    }

    // MỚI: Hàm toggle chọn hạng vé
    const handleClassToggle = (classId) => {
        setPriceConfig(prev => {
            const isEnabled = prev[classId]?.enabled
            if (isEnabled) {
                // Nếu đang chọn -> bỏ chọn (xóa data)
                const newState = { ...prev }
                delete newState[classId]
                return newState
            } else {
                // Nếu chưa chọn -> khởi tạo default
                return {
                    ...prev,
                    [classId]: { enabled: true, basePrice: '', tax: '', seats: '' }
                }
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.departureAirportId === formData.arrivalAirportId) {
            alert("Sân bay đi và sân bay đến không được trùng nhau!")
            return
        }

        // Validate Price Config
        const selectedClasses = Object.values(priceConfig).filter(p => p.enabled);
        if (selectedClasses.length === 0) {
            alert("Vui lòng cấu hình giá vé cho ít nhất 1 hạng vé!");
            return;
        }

        setIsSubmitting(true)
        const token = localStorage.getItem("token")
        const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

        try {
            // --- BƯỚC 1: Tạo Flight Schedule ---
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
                method: "POST", headers, body: JSON.stringify(schedulePayload)
            })
            const scheduleData = await scheduleRes.json()
            if (!scheduleRes.ok) throw new Error(scheduleData.message || "Lỗi tạo lịch trình")
            
            const scheduleId = scheduleData.body.scheduleId

            // --- BƯỚC 2: Tạo Flight ---
            const flightPayload = {
                scheduleId: scheduleId,
                aircraftId: parseInt(formData.aircraftId),
                departureDate: formData.departureTime, // Lưu ý: Backend có thể cần logic ghép ngày + giờ
                flightDate: formData.flightDate,
            }

            const flightRes = await fetch(`${API_BASE_URL}/flights`, {
                method: "POST", headers, body: JSON.stringify(flightPayload)
            })
            const flightDataResponse = await flightRes.json()
            
            if (!flightRes.ok) {
                console.error("Flight Error:", flightDataResponse)
                throw new Error(flightDataResponse.message || "Lỗi tạo chuyến bay")
            }

            const newFlightId = flightDataResponse.body.flightId

            // --- BƯỚC 3: Tạo Flight Price (MỚI) ---
            // Duyệt qua các hạng vé đã cấu hình và gửi request tạo giá
            const pricePromises = Object.entries(priceConfig).map(async ([classIdStr, config]) => {
                if (!config.enabled) return null;

                const pricePayload = {
                    flightId: newFlightId,
                    ticketClassId: parseInt(classIdStr),
                    basePrice: parseFloat(config.basePrice),
                    tax: parseFloat(config.tax || 0),
                    totalSeats: parseInt(config.seats),
                    availableSeats: parseInt(config.seats) // Mặc định ban đầu available = total
                }

                return fetch(`${API_BASE_URL}/flightPrice`, {
                    method: "POST", headers, body: JSON.stringify(pricePayload)
                });
            });

            await Promise.all(pricePromises);

            toast({ title: "Thành công", description: `Đã tạo chuyến bay ${formData.flightNumber} và cấu hình giá vé.` })
            setIsOpen(false)
            
            // Reset form
            setFormData({ flightNumber: '', airlineId: '', departureAirportId: '', arrivalAirportId: '', departureTime: '', arrivalTime: '', flightDate: '', aircraftId: '' })
            setPriceConfig({})
            
            if (onSave) onSave(); // Callback reload dữ liệu ở component cha
            else window.location.reload();

        } catch (error) {
            console.error(error)
            toast({ variant: "destructive", title: "Có lỗi xảy ra", description: error.message })
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

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Plane className="h-6 w-6 text-primary" /> Thiết lập Chuyến Bay Mới
                    </DialogTitle>
                    <DialogDescription>
                        Nhập thông tin lịch trình, máy bay và cấu hình giá vé cho từng hạng ghế.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center p-10">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-2">
                        
                        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">1. Thông tin vận hành</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Số hiệu (Flight No.) <span className="text-red-500">*</span></Label>
                                    <Input placeholder="VN..." value={formData.flightNumber} onChange={(e) => setFormData({...formData, flightNumber: e.target.value.toUpperCase()})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hãng hàng không <span className="text-red-500">*</span></Label>
                                    <Select onValueChange={(val) => setFormData({...formData, airlineId: val})} required>
                                        <SelectTrigger><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
                                        <SelectContent>
                                            {airlines.map((a) => (
                                                <SelectItem key={a.airlineId} value={a.airlineId.toString()}>{a.airlineCode} - {a.airlineName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border">
                                <div className="space-y-2">
                                    <Label>Sân bay đi</Label>
                                    <Select onValueChange={(val) => setFormData({...formData, departureAirportId: val})} required>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Điểm đi" /></SelectTrigger>
                                        <SelectContent>
                                            {airports.map((ap) => (
                                                <SelectItem key={ap.airportCode} value={ap.airportCode}>{ap.city} ({ap.airportCode})</SelectItem>
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
                                                <SelectItem key={ap.airportCode} value={ap.airportCode}>{ap.city} ({ap.airportCode})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tàu bay (Aircraft) <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => setFormData({...formData, aircraftId: val})} required>
                                    <SelectTrigger><SelectValue placeholder="Chọn máy bay" /></SelectTrigger>
                                    <SelectContent>
                                        {aircrafts.map((ac) => (
                                            <SelectItem key={ac.aircraftId} value={ac.aircraftId.toString()}>
                                                {ac.registrationNumber} - {ac.aircraftType?.typeName} ({ac.statusAircraft})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Ngày bay</Label>
                                    <Input type="date" onChange={(e) => setFormData({...formData, flightDate: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giờ đi</Label>
                                    <Input type="time" onChange={(e) => setFormData({...formData, departureTime: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giờ đến</Label>
                                    <Input type="time" onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} required />
                                </div>
                            </div>
                        </div>

                        {/* --- PHẦN 2: CẤU HÌNH GIÁ VÉ (MỚI) --- */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 mt-6 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> 2. Cấu hình Hạng Vé & Giá
                            </h3>
                            
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {ticketClasses.length === 0 && <p className="text-sm text-gray-500 italic">Chưa có dữ liệu hạng vé.</p>}
                                
                                {ticketClasses.map((tc) => {
                                    const isChecked = !!priceConfig[tc.classId]?.enabled;
                                    return (
                                        <div key={tc.classId} className={cn("flex flex-col gap-3 p-3 rounded-md border transition-all", isChecked ? "bg-white border-blue-400 shadow-sm" : "bg-transparent border-transparent opacity-70 hover:opacity-100")}>
                                            <div className="flex items-center gap-3">
                                                <Checkbox 
                                                    id={`class-${tc.classId}`} 
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleClassToggle(tc.classId)}
                                                />
                                                <Label htmlFor={`class-${tc.classId}`} className="font-bold text-base cursor-pointer flex-1">
                                                    {tc.className}
                                                </Label>
                                                {isChecked && (
                                                    <span className="text-xs text-blue-600 font-medium">Đang kích hoạt</span>
                                                )}
                                            </div>

                                            {isChecked && (
                                                <div className="grid grid-cols-3 gap-3 pl-7 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500">Giá cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                            <Input 
                                                                type="number" min="0" placeholder="0" className="h-8 pl-7 text-sm"
                                                                value={priceConfig[tc.classId]?.basePrice || ''}
                                                                onChange={(e) => handlePriceChange(tc.classId, 'basePrice', e.target.value)}
                                                                required={isChecked}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500">Thuế/Phí (VNĐ)</Label>
                                                        <Input 
                                                            type="number" min="0" placeholder="0" className="h-8 text-sm"
                                                            value={priceConfig[tc.classId]?.tax || ''}
                                                            onChange={(e) => handlePriceChange(tc.classId, 'tax', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500">Số ghế mở bán <span className="text-red-500">*</span></Label>
                                                        <Input 
                                                            type="number" min="1" placeholder="Số lượng" className="h-8 text-sm"
                                                            value={priceConfig[tc.classId]?.seats || ''}
                                                            onChange={(e) => handlePriceChange(tc.classId, 'seats', e.target.value)}
                                                            required={isChecked}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 sticky bottom-0 bg-white z-10">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-primary text-white font-bold text-md shadow-lg hover:bg-blue-700 transition-all">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                                XÁC NHẬN TẠO CHUYẾN BAY & GIÁ VÉ
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}