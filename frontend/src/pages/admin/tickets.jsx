import React, { useState, useEffect, useCallback } from 'react';
// Icons from Lucide (Đã sửa lỗi: 'Chair' không tồn tại, thay bằng 'Armchair')
import { 
    Search, Loader2, Plane, Ticket, X, Plus, Edit, Trash2, DollarSign, LayoutGrid, Armchair, CheckCircle, XCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog,DialogContent,DialogTitle,DialogDescription,DialogFooter,DialogHeader } from '@/components/ui/dialog-admin';
import { Badge } from '@/components/ui/badge';
import { Tabs,TabsList,TabsContent } from '@/components/ui/tabs';
import { Table,TableHead,TableHeader,TableBody,TableRow,TableCell } from '@/components/ui/table-admin';
import { useToast } from '@/hooks/use-toast';

// ===========================================
// MOCK UI COMPONENTS (Consistent with previous designs)
// ===========================================

const TabsTrigger = ({ children, value, activeTab, onValueChange, icon: Icon }) => (
    <button 
        className={`flex-grow py-2 px-4 rounded-lg text-gray-700 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 
            ${activeTab === value ? 'bg-white text-blue-600 shadow-md ring-2 ring-blue-100' : 'hover:bg-gray-200'}`}
        onClick={() => onValueChange(value)}
    >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{children}</span>
    </button>
);


// --- UTILITY FUNCTIONS ---
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('vi-VN');
    const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
};
const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString('vi-VN') + '₫' : '0₫';
};

// ===========================================
// MOCK DATA & SUB-COMPONENTS DEFINITIONS
// ===========================================

// --- Dữ liệu Mock (Sử dụng lại) ---
const MOCK_FLIGHTS = [
    { "id": "FL001", "flight_number": "VN1234", "departure_city": "Hà Nội", "arrival_city": "TP. Hồ Chí Minh", "departure_time": { "seconds": 1730000000, "nanoseconds": 0 }, "arrival_time": { "seconds": 1730007200, "nanoseconds": 0 }, "ticket_list": ["T1", "T2", "T3"], "total_seats": 150, "aircraft_id": "MB001" },
    { "id": "FL002", "flight_number": "VJ5678", "departure_city": "Đà Nẵng", "arrival_city": "Hà Nội", "departure_time": { "seconds": 1730100000, "nanoseconds": 0 }, "arrival_time": { "seconds": 1730105400, "nanoseconds": 0 }, "ticket_list": [], "total_seats": 180, "aircraft_id": "MB002" },
    { "id": "FL003", "flight_number": "QH9012", "departure_city": "TP. Hồ Chí Minh", "arrival_city": "Phú Quốc", "departure_time": { "seconds": 1730200000, "nanoseconds": 0 }, "arrival_time": { "seconds": 1730203600, "nanoseconds": 0 }, "ticket_list": ["T4", "T5", "T6", "T7", "T8"], "total_seats": 100, "aircraft_id": "MB001" }
];
const MOCK_TICKETS = [
    { "ticketId": "T1", "status": "Active", "seatCode": "A01", "flightClass": "Business", "price": 3500000, "owner": { "firstName": "An", "lastName": "Nguyễn", "phoneNumber": "0901234567" } },
    { "ticketId": "T2", "status": "Cancelled", "seatCode": "E15", "flightClass": "Economy", "price": 1200000, "owner": { "firstName": "Bình", "lastName": "Trần", "phoneNumber": "0987654321" } },
    { "ticketId": "T3", "status": "Active", "seatCode": "A02", "flightClass": "Business", "price": 3500000, "owner": { "firstName": "Cường", "lastName": "Lê", "phoneNumber": "0912345678" } }
];
const MOCK_FLIGHT_CLASSES = [
    { id: 'FC001', name: 'Economy', priceMultiplier: 1.0, luggage: '20kg' },
    { id: 'FC002', name: 'Premium Economy', priceMultiplier: 1.5, luggage: '30kg' },
    { id: 'FC003', name: 'Business', priceMultiplier: 2.5, luggage: '40kg' },
];
const MOCK_FLIGHT_PRICES = [
    { id: 'PR001', flightId: 'FL001', basePrice: 1000000, classId: 'FC001', updatedAt: '2025-10-20' },
    { id: 'PR002', flightId: 'FL001', basePrice: 1500000, classId: 'FC003', updatedAt: '2025-10-20' },
];
const MOCK_SEAT_LAYOUT = {
    aircraftId: 'MB001', rows: 15, columns: 6, 
    classAssignment: { '1-5': 'Business', '6-10': 'Premium Economy', '11-15': 'Economy' },
    maintenanceSeats: ['1A', '1B', '15F']
};

// ------------------------------------------
// --- Sub-Component: Quản lý Chuyến bay & Vé (Đã định nghĩa lại) ---
// ------------------------------------------
const FlightListManagement = ({ flights, onFlightClick, isLoading, calculateSoldTickets }) => {
    return (
        <div className="space-y-4">
            <div className="border rounded-xl overflow-hidden shadow-md">
                <TableHeader className="min-w-[800px] grid-cols-[1fr_3fr_3fr_1.5fr_1.5fr]">
                    <TableHead>SỐ HIỆU</TableHead>
                    <TableHead>ĐIỂM XUẤT PHÁT & THỜI GIAN</TableHead>
                    <TableHead>ĐIỂM ĐẾN & THỜI GIAN</TableHead>
                    <TableHead className="text-center">TÌNH TRẠNG VÉ</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow className="h-24"><TableCell colSpan={5} className="text-center"><Loader2 className="mr-2 h-5 w-5 animate-spin inline-block text-blue-500" /> Đang tải danh sách chuyến bay...</TableCell></TableRow>
                    ) : flights.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={5} className="text-center text-gray-500">Không tìm thấy chuyến bay nào.</TableCell></TableRow>
                    ) : (
                        flights.map((flight) => (
                            <TableRow key={flight.id} className="min-w-[800px] grid-cols-[1fr_3fr_3fr_1.5fr_1.5fr]">
                                <TableCell className="font-semibold text-blue-700">{flight.flightNumber}</TableCell>
                                <TableCell className="text-sm">{flight.departure}</TableCell>
                                <TableCell className="text-sm">{flight.arrival}</TableCell>
                                <TableCell className="text-center font-bold text-gray-700">
                                    {calculateSoldTickets(flight).sold} / {calculateSoldTickets(flight).total}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="purple" size="default" className="text-sm h-9 px-3" onClick={() => onFlightClick(flight)}>
                                        <Ticket className="w-4 h-4 mr-1" /> Xem vé
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>
        </div>
    );
};

// ------------------------------------------
// --- Sub-Component: Quản lý Hạng vé (40-43) ---
// ------------------------------------------
const FlightClassManagement = ({ classes, onAction, toast }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', priceMultiplier: 1.0, luggage: '' });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || parseFloat(formData.priceMultiplier) <= 0) {
            toast({ title: "Lỗi", description: "Vui lòng điền đủ tên và hệ số giá.", variant: "destructive" });
            return;
        }

        onAction({ type: isEditing ? 'UPDATE_CLASS' : 'ADD_CLASS', payload: { ...formData, priceMultiplier: parseFloat(formData.priceMultiplier) } });
        setIsDialogOpen(false);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ id: '', name: '', priceMultiplier: 1.0, luggage: '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <Button onClick={handleAdd} variant="primary" className="w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" /> THÊM HẠNG VÉ MỚI
            </Button>
            
            <div className="border rounded-xl overflow-hidden shadow-md">
                <TableHeader className="grid-cols-[2fr_1.5fr_2fr_2fr_1fr]">
                    <TableHead>TÊN HẠNG VÉ</TableHead>
                    <TableHead>HỆ SỐ GIÁ</TableHead>
                    <TableHead>HÀNH LÝ KÝ GỬI</TableHead>
                    <TableHead>MÃ NỘI BỘ</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {classes.map(item => (
                        <TableRow key={item.id} className="grid-cols-[2fr_1.5fr_2fr_2fr_1fr]">
                            <TableCell className="font-semibold text-purple-600">{item.name}</TableCell>
                            <TableCell>{item.priceMultiplier}x</TableCell>
                            <TableCell>{item.luggage || 'Không giới hạn'}</TableCell>
                            <TableCell className="text-gray-500 text-sm">{item.id}</TableCell>
                            <TableCell className="text-center flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_CLASS', payload: item.id })}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? 'Sửa Hạng vé' : 'Thêm Hạng vé Mới'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="name">Tên Hạng vé</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                        <div><Label htmlFor="multiplier">Hệ số giá (so với giá cơ sở)</Label><Input id="multiplier" type="number" min="0.1" step="0.1" value={formData.priceMultiplier} onChange={e => setFormData({...formData, priceMultiplier: e.target.value})} required /></div>
                        <div><Label htmlFor="luggage">Hành lý ký gửi</Label><Input id="luggage" value={formData.luggage} onChange={e => setFormData({...formData, luggage: e.target.value})} placeholder="VD: 20kg" /></div>
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ------------------------------------------
// --- Sub-Component: Quản lý Giá vé (44-46) ---
// ------------------------------------------
const PricingManagement = ({ classes, prices, flights, onAction, toast }) => {
    const [selectedFlightId, setSelectedFlightId] = useState(flights[0]?.id || '');

    const currentPrices = prices.filter(p => p.flightId === selectedFlightId);
    const flightInfo = flights.find(f => f.id === selectedFlightId);

    const handleUpdatePrice = (priceEntry) => {
        const newPrice = prompt(`Nhập GIÁ CƠ SỞ mới (VND) cho hạng ${classes.find(c => c.id === priceEntry.classId)?.name} trên chuyến ${flightInfo.flightNumber}:`, priceEntry.basePrice);
        if (newPrice && !isNaN(newPrice) && parseInt(newPrice) > 0) {
            onAction({ 
                type: 'UPDATE_BASE_PRICE', 
                payload: { 
                    ...priceEntry, 
                    basePrice: parseInt(newPrice),
                    updatedAt: new Date().toISOString().split('T')[0]
                }
            });
        }
    };
    
    const handleSetupNewPrice = (classId) => {
        const newPrice = prompt(`Thiết lập GIÁ CƠ SỞ (VND) cho hạng ${classes.find(c => c.id === classId)?.name} trên chuyến ${flightInfo.flightNumber}:`);
        if (newPrice && !isNaN(newPrice) && parseInt(newPrice) > 0) {
            onAction({ 
                type: 'SETUP_FLIGHT_PRICE', 
                payload: { 
                    flightId: selectedFlightId, 
                    classId, 
                    basePrice: parseInt(newPrice) 
                }
            });
        }
    };
    
    const classesWithoutPrice = classes.filter(c => !currentPrices.some(p => p.classId === c.id));

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                <Label htmlFor="flightSelect" className="mb-0 font-bold flex-shrink-0 text-lg">Chọn Chuyến bay:</Label>
                <select 
                    id="flightSelect"
                    value={selectedFlightId} 
                    onChange={e => setSelectedFlightId(e.target.value)}
                    className="w-full p-3 border rounded-lg h-11 border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                    {flights.map(f => (
                        <option key={f.id} value={f.id}>{f.flightNumber} ({f.departureCity} - {f.arrivalCity})</option>
                    ))}
                </select>
            </div>
            
            {selectedFlightId && (
                <>
                    <div className="border rounded-xl overflow-hidden shadow-md">
                        <TableHeader className="grid-cols-[2fr_1.5fr_1.5fr_2fr_1fr]">
                            <TableHead>TÊN HẠNG VÉ</TableHead>
                            <TableHead>GIÁ CƠ SỞ</TableHead>
                            <TableHead>TỔNG GIÁ VÉ</TableHead>
                            <TableHead>CẬP NHẬT GẦN NHẤT</TableHead>
                            <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                        </TableHeader>
                        <TableBody>
                            {currentPrices.map(priceEntry => {
                                const classInfo = classes.find(c => c.id === priceEntry.classId);
                                const finalPrice = priceEntry.basePrice * classInfo?.priceMultiplier;

                                return (
                                    <TableRow key={priceEntry.id} className="grid-cols-[2fr_1.5fr_1.5fr_2fr_1fr]">
                                        <TableCell className="font-semibold text-purple-600">{classInfo?.name}</TableCell>
                                        <TableCell className="text-orange-600 font-medium">{formatCurrency(priceEntry.basePrice)}</TableCell>
                                        <TableCell className="font-bold text-green-700">{formatCurrency(finalPrice)}</TableCell>
                                        <TableCell className="text-sm text-gray-500">{priceEntry.updatedAt}</TableCell>
                                        <TableCell className="text-center flex space-x-2">
                                            <Button size="sm" variant="primary" onClick={() => handleUpdatePrice(priceEntry)}>
                                                <DollarSign className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => toast({title: "Mock", description: "Đã xem lịch sử thay đổi giá vé (MOCK)."})}>
                                                <Ticket className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </div>

                    {classesWithoutPrice.length > 0 && (
                        <div className="p-4 border border-dashed rounded-xl bg-yellow-50">
                            <h4 className="font-bold text-yellow-800 mb-3 text-lg">Thiết lập Giá vé cho các Hạng còn thiếu:</h4>
                            <div className="flex flex-wrap gap-3">
                                {classesWithoutPrice.map(c => (
                                    <Button key={c.id} variant="warning" onClick={() => handleSetupNewPrice(c.id)} className="bg-yellow-600 text-white hover:bg-yellow-700">
                                        <Plus className="h-4 w-4 mr-1" /> {c.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ------------------------------------------
// --- Sub-Component: Quản lý Sơ đồ ghế (47-50) ---
// ------------------------------------------
const SeatLayoutManagement = ({ layout, onAction, toast }) => {
    const renderSeatMap = (layout) => {
        const seats = [];
        for (let r = 1; r <= layout.rows; r++) {
            const rowSeats = [];
            for (let c = 0; c < layout.columns; c++) {
                const colLetter = String.fromCharCode(65 + c);
                const seatCode = `${r}${colLetter}`;
                const isMaintenance = layout.maintenanceSeats.includes(seatCode);
                
                let seatClass = 'Economy';
                for (const range in layout.classAssignment) {
                    const [start, end] = range.split('-').map(Number);
                    if (r >= start && r <= end) {
                        seatClass = layout.classAssignment[range];
                        break;
                    }
                }

                const baseStyle = "w-8 h-8 flex items-center justify-center m-0.5 rounded-sm text-xs font-semibold border transition-colors cursor-pointer";
                let style = baseStyle;
                
                if (isMaintenance) {
                    style += ' bg-gray text-white border-gray-700 cursor-not-allowed';
                } else if (seatClass === 'Business') {
                    style += ' bg-yellow-300 hover:bg-yellow-400 text-gray-900 border-yellow-500';
                } else if (seatClass === 'Premium Economy') {
                    style += ' bg-blue-300 hover:bg-blue-400 text-gray-900 border-blue-500';
                } else {
                    style += ' bg-green-300 hover:bg-green-400 text-gray-900 border-green-500';
                }

                rowSeats.push(
                    <div key={seatCode} className={style} title={`${seatClass} - ${seatCode}`}>
                        {colLetter}
                    </div>
                );
            }
            seats.push(
                <div key={r} className="flex items-center space-x-2 mb-1">
                    <span className="w-5 text-xs font-bold text-gray-500 flex-shrink-0">{r}</span>
                    <div className="flex">
                        {rowSeats.slice(0, 3)}
                    </div>
                    <div className="w-8 text-center text-xs text-gray-400 flex-shrink-0">Lối đi</div>
                    <div className="flex">
                        {rowSeats.slice(3)}
                    </div>
                </div>
            );
        }
        return seats;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3 p-4 border rounded-xl bg-gray-50">
                <Button variant="outline" className="text-sm" onClick={() => toast({title: "Mock", description: "Mở Dialog Thiết kế sơ đồ (47) - Mock"})}>
                    <Plane className="h-4 w-4 mr-2" /> Thiết kế Sơ đồ ghế
                </Button>
                <Button variant="outline" className="text-sm" onClick={() => toast({title: "Mock", description: "Mở Dialog Cấu hình loại ghế theo dãy (48) - Mock"})}>
                    <Armchair className="h-4 w-4 mr-2" /> Cấu hình Loại Ghế
                </Button>
                <Button variant="outline" className="text-sm" onClick={() => toast({title: "Mock", description: "Mở Dialog Đánh dấu ghế bảo trì (49) - Mock"})}>
                    <X className="h-4 w-4 mr-2" /> Ghế Bảo Trì
                </Button>
            </div>

            <div className="p-4 border rounded-xl bg-white overflow-x-auto shadow-lg">
                <h4 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">
                    Sơ đồ Ghế Mẫu ({layout.aircraftId})
                </h4>
                <div className="min-w-[400px] flex justify-center py-4">
                    <div className="space-y-2">
                        {renderSeatMap(layout)}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center flex-wrap gap-4 text-sm font-medium">
                <Badge variant="warning" className="bg-yellow-300 text-gray-900">Business</Badge>
                <Badge variant="primary" className="bg-blue-300 text-gray-900">Premium Economy</Badge>
                <Badge variant="success" className="bg-green-300 text-gray-900">Economy</Badge>
                <Badge variant="default" className="bg-gray-500 text-gray-900 border-gray">Bảo Trì</Badge>
            </div>
        </div>
    );
};


// ------------------------------------------
// --- MAIN DASHBOARD COMPONENT ---
// ------------------------------------------
function TicketManagementDashboard() {
    const { toast } = useToast();

    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("flights");

    const [flightClasses, setFlightClasses] = useState(MOCK_FLIGHT_CLASSES);
    const [flightPrices, setFlightPrices] = useState(MOCK_FLIGHT_PRICES);
    const [seatLayout, setSeatLayout] = useState(MOCK_SEAT_LAYOUT);
    
    // --- Mock API calls (Reused and simplified) ---
    const getAllFlights = useCallback(async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        try {
            const res = { data: { flights: MOCK_FLIGHTS } };
            setFlights(res.data.flights.map(a => {
                const departureTime = new Date(a.departure_time.seconds * 1000);
                const arrivalTime = new Date(a.arrival_time.seconds * 1000);
                return {
                    "id": a.id, "flightNumber": a.flight_number,
                    "arrival": `${a.arrival_city} (${formatDate(arrivalTime.toISOString())})`,
                    "departure": `${a.departure_city} (${formatDate(departureTime.toISOString())})`,
                    "departureCity": a.departure_city, "arrivalCity": a.arrival_city,
                    "ticketList": a.ticket_list, "totalSeats": a.total_seats || 100,
                    "aircraftId": a.aircraft_id
                }
            }));
        } catch (error) {
          toast({ title: "Lỗi", description: "MOCK: Tải chuyến bay thất bại.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const getTickets = async (flight) => {
        if(flight.ticketList.length === 0){ setTickets([]); setIsDialogOpen(true); return; }
        await new Promise(resolve => setTimeout(resolve, 500));
        setTickets(MOCK_TICKETS.map(a => ({
            "status": a.status, "seatCode": a.seatCode, "ownerData": a.owner, 
            "flightClass": a.flightClass, "ticketId": a.ticketId, "price": a.price, 
            "flightId": flight.id, "updatedAt": '2025-10-27', "bookingId": 'BKG123', "createdAt": '2025-10-26'
        })));
        setIsDialogOpen(true);
    };

    const handleCancelTicket = async (ticketId) => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setTickets(prevTickets => prevTickets.map(t => t.ticketId === ticketId ? { ...t, status: 'Cancelled' } : t));
        toast({ title: "Thành công", description: `Vé ${ticketId} đã được hủy thành công (MOCK)`, variant: "destructive" });
    };

    const handleFlightClick = (flight) => {
        setSelectedFlight(flight);
        getTickets(flight);
    };
    
    const handleMasterAction = ({ type, payload }) => {
        let description = "Thành công (MOCK).";
        let success = true;
        
        switch (type) {
            // Hạng vé (40-43)
            case 'ADD_CLASS': setFlightClasses(prev => [...prev, { ...payload, id: `FC${Date.now()}` }]); description = `Đã thêm hạng vé ${payload.name}.`; break;
            case 'UPDATE_CLASS': setFlightClasses(prev => prev.map(c => c.id === payload.id ? payload : c)); description = `Đã cập nhật hạng vé ${payload.name}.`; break;
            case 'DELETE_CLASS': setFlightClasses(prev => prev.filter(c => c.id !== payload)); description = "Đã xóa hạng vé."; break;
            // Giá vé (44-46)
            case 'SETUP_FLIGHT_PRICE':
                setFlightPrices(prev => [...prev, { ...payload, id: `PR${Date.now()}`, updatedAt: new Date().toISOString().split('T')[0] }]);
                description = "Đã thiết lập giá vé cơ sở mới."; break;
            case 'UPDATE_BASE_PRICE':
                setFlightPrices(prev => prev.map(p => p.id === payload.id ? payload : p));
                description = "Đã cập nhật giá vé cơ sở."; break;

            default: success = false; description = "Hành động không xác định.";
        }
        toast({ title: success ? "Thành công" : "Lỗi", description, variant: success ? "success" : "destructive" });
    };

    useEffect(() => {
        getAllFlights();
    }, [getAllFlights]);

    // Hàm tiện ích tính vé đã bán
    const calculateSoldTickets = (flight) => {
        const currentTickets = selectedFlight?.id === flight.id ? tickets : [];
        let sold = 0;
        if (currentTickets.length > 0) {
             sold = currentTickets.filter(t => t.status !== 'Cancelled').length;
        } else {
             sold = flight.ticketList?.length || 0;
        }
        return { sold, total: flight.totalSeats };
    };

    const getTicketStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <Badge variant="success">Đã bán</Badge>;
            case 'Cancelled': return <Badge variant="destructive">Đã hủy</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };


    // --- Render Component ---
    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl w-[1000px] pt-4">
                
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Ticket className="w-7 h-7 text-blue-600" />
                        <span>QUẢN LÝ HỆ THỐNG VÉ MÁY BAY</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các chuyến bay, chi tiết vé đã bán, hạng vé, giá vé và sơ đồ ghế.</p>
                </header>

                {/* Main Content with Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="flights" activeTab={activeTab} onValueChange={setActiveTab} icon={Plane}>Chuyến bay & Vé</TabsTrigger>
                            <TabsTrigger value="classes" activeTab={activeTab} onValueChange={setActiveTab} icon={Armchair}>Hạng vé</TabsTrigger>
                            <TabsTrigger value="pricing" activeTab={activeTab} onValueChange={setActiveTab} icon={DollarSign}>Giá vé</TabsTrigger>
                            <TabsTrigger value="layout" activeTab={activeTab} onValueChange={setActiveTab} icon={LayoutGrid}>Sơ đồ ghế</TabsTrigger>
                        </TabsList>

                        <div className="mt-6 border rounded-xl p-6 bg-white shadow-xl relative">
                            
                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-xl">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            )}

                            {/* Tab 1: Quản lý Chuyến bay & Vé */}
                            <TabsContent value="flights" activeTab={activeTab}>
                                <FlightListManagement 
                                    flights={flights}
                                    onFlightClick={handleFlightClick}
                                    isLoading={false} // Loading handled by parent
                                    calculateSoldTickets={calculateSoldTickets}
                                />
                            </TabsContent>
                            
                            {/* Tab 2: Quản lý Hạng vé (40-43) */}
                            <TabsContent value="classes" activeTab={activeTab}>
                                <FlightClassManagement 
                                    classes={flightClasses}
                                    onAction={handleMasterAction}
                                    toast={toast}
                                />
                            </TabsContent>

                            {/* Tab 3: Quản lý Giá vé (44-46) */}
                            <TabsContent value="pricing" activeTab={activeTab}>
                                <PricingManagement
                                    classes={flightClasses}
                                    prices={flightPrices}
                                    flights={flights}
                                    onAction={handleMasterAction}
                                    toast={toast}
                                />
                            </TabsContent>
                            
                            {/* Tab 4: Quản lý Sơ đồ ghế (47-50) */}
                            <TabsContent value="layout" activeTab={activeTab}>
                                <SeatLayoutManagement
                                    layout={seatLayout}
                                    onAction={handleMasterAction}
                                    toast={toast}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Dialog Chi tiết Vé - Dùng Dialog Rộng */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} wide={true}>
                    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-800">
                                Chi tiết Vé chuyến bay: {selectedFlight?.flightNumber}
                            </DialogTitle>
                            <DialogDescription className="text-base text-gray-600">
                                {selectedFlight?.departureCity} &rarr; {selectedFlight?.arrivalCity} | {selectedFlight?.departure.split('(')[1]}
                            </DialogDescription>
                        </DialogHeader>
                            
                        <div className="flex-1 overflow-y-auto pr-2">
                            {tickets.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 border border-dashed rounded-xl p-5">
                                    <Ticket className="w-10 h-10 mx-auto mb-3" />
                                    <p className="font-semibold text-lg">Chuyến bay này chưa có vé nào được bán.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="sticky top-0 bg-white shadow-sm z-10 grid-cols-[1fr_1fr_1fr_1fr_1.5fr_3fr_1fr]">
                                        <TableHead>MÃ VÉ</TableHead>
                                        <TableHead>TRẠẠNG THÁI</TableHead>
                                        <TableHead>GHẾ</TableHead>
                                        <TableHead>HẠNG</TableHead>
                                        <TableHead>GIÁ</TableHead>
                                        <TableHead>HÀNH KHÁCH & SĐT</TableHead>
                                        <TableHead className="text-center">HỦY</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.map((ticket) => (
                                            <TableRow key={ticket.ticketId} className="grid-cols-[1fr_1fr_1fr_1fr_1.5fr_3fr_1fr]">
                                                <TableCell className="font-medium text-purple-700">{ticket.ticketId}</TableCell>
                                                <TableCell>{getTicketStatusBadge(ticket.status)}</TableCell>
                                                <TableCell className="font-mono">{ticket.seatCode}</TableCell>
                                                <TableCell>{ticket.flightClass}</TableCell>
                                                <TableCell className="font-semibold text-blue-700">{formatCurrency(ticket.price)}</TableCell>
                                                <TableCell>
                                                    <p className="font-medium text-gray-900">{`${ticket.ownerData.lastName} ${ticket.ownerData.firstName}`}</p>
                                                    <p className="text-sm text-gray-500">{ticket.ownerData.phoneNumber}</p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        disabled={ticket.status === 'Cancelled'}
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleCancelTicket(ticket.ticketId)}
                                                        title="Hủy vé"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// Export as App
export default TicketManagementDashboard;
