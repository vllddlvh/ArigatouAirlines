import React, { useState, useEffect, useCallback } from 'react';
// Icons from Lucide (Đã sửa lỗi: 'Chair' không tồn tại, thay bằng 'Armchair')
import { 
    Search, Loader2, Plane, Ticket, X, Plus, Edit, Trash2, DollarSign, LayoutGrid, Armchair, CheckCircle, XCircle, Eye 
} from 'lucide-react';
import { getAllFlights, getFlightById, getFlightPricesByFlightId, updateFlightPrice } from '@/services/masterDataService';
import { getTicketsByFlightId } from '@/services/ticketService';
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
    if (amount === null || amount === undefined) return '0₫';
    const value = typeof amount === 'string' ? Number(amount) : amount;
    if (!Number.isFinite(value)) return '0₫';
    return value.toLocaleString('vi-VN') + '₫';
};

// ===========================================
// MOCK DATA & SUB-COMPONENTS DEFINITIONS
// ===========================================

// --- Dữ liệu Mock (Fallback) ---
const MOCK_FLIGHTS = [];
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
                <TableHeader className="min-w-[1000px] grid-cols-[1fr_2fr_3fr_3fr_1.5fr_1.5fr]">
                    <TableHead>SỐ HIỆU</TableHead>
                    <TableHead>MÁY BAY & HÃNG</TableHead>
                    <TableHead>ĐIỂM XUẤT PHÁT & THỜI GIAN</TableHead>
                    <TableHead>ĐIỂM ĐẾN & THỜI GIAN</TableHead>
                    <TableHead className="text-center">TÌNH TRẠNG VÉ</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow className="h-24"><TableCell colSpan={6} className="text-center"><Loader2 className="mr-2 h-5 w-5 animate-spin inline-block text-blue-500" /> Đang tải danh sách chuyến bay...</TableCell></TableRow>
                    ) : flights.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={6} className="text-center text-gray-500">Không tìm thấy chuyến bay nào.</TableCell></TableRow>
                    ) : (
                        flights.map((flight) => (
                            <TableRow key={flight.id} className="min-w-[1000px] grid-cols-[1fr_2fr_3fr_3fr_1.5fr_1.5fr]">
                                <TableCell className="font-semibold text-blue-700">{flight.flightNumber}</TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">{flight.aircraftTypeName || 'N/A'}</span>
                                        <span className="text-xs text-blue-600 font-bold">{flight.airlineName || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{flight.departure}</TableCell>
                                <TableCell className="text-sm">{flight.arrival}</TableCell>
                                <TableCell className="text-center font-bold text-gray-700">
                                    {calculateSoldTickets(flight).booked} / {calculateSoldTickets(flight).total}
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
const PricingManagement = ({ flights, toast }) => {
    const [selectedFlightId, setSelectedFlightId] = useState('');
    const [flightPrices, setFlightPrices] = useState([]);
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [editForm, setEditForm] = useState({ basePrice: '', tax: '' });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const flightInfo = flights.find(f => String(f.id) === String(selectedFlightId));

    // Fetch giá vé từ API khi chọn chuyến bay
    const fetchPricesForFlight = useCallback(async (flightId) => {
        if (!flightId) {
            setFlightPrices([]);
            return;
        }
        setIsLoadingPrices(true);
        try {
            console.log("Fetching prices for flight:", flightId);
            const prices = await getFlightPricesByFlightId(flightId);
            console.log("Prices received:", prices);
            setFlightPrices(Array.isArray(prices) ? prices : []);
        } catch (error) {
            console.error("Lỗi tải giá vé:", error);
            setFlightPrices([]);
            toast({ title: "Lỗi", description: "Không thể tải giá vé cho chuyến bay này.", variant: "destructive" });
        } finally {
            setIsLoadingPrices(false);
        }
    }, [toast]);

    // Khi flights thay đổi, set default selection
    useEffect(() => {
        if (flights.length > 0 && !selectedFlightId) {
            const firstId = flights[0]?.id;
            if (firstId) {
                setSelectedFlightId(String(firstId));
            }
        }
    }, [flights, selectedFlightId]);

    // Khi selectedFlightId thay đổi, fetch prices
    useEffect(() => {
        if (selectedFlightId) {
            fetchPricesForFlight(selectedFlightId);
        }
    }, [selectedFlightId, fetchPricesForFlight]);

    // Xử lý edit giá vé
    const handleEditPrice = (priceEntry) => {
        setEditingPrice(priceEntry);
        setEditForm({
            basePrice: String(priceEntry.basePrice || 0),
            tax: String(priceEntry.tax || 0)
        });
        setIsEditDialogOpen(true);
    };

    const handleSavePrice = async () => {
        if (!editingPrice) return;
        try {
            const updateData = {
                flightId: editingPrice.flightId,
                ticketClassId: editingPrice.ticketClass?.classId,
                basePrice: Number(editForm.basePrice),
                tax: Number(editForm.tax),
                totalSeats: editingPrice.totalSeats || 0,
                availableSeats: editingPrice.availableSeats || 0
            };
            await updateFlightPrice(editingPrice.priceId, updateData);
            toast({ title: "Thành công", description: "Đã cập nhật giá vé thành công!" });
            setIsEditDialogOpen(false);
            setEditingPrice(null);
            fetchPricesForFlight(selectedFlightId);
        } catch (error) {
            console.error("Lỗi cập nhật giá:", error);
            toast({ title: "Lỗi", description: "Không thể cập nhật giá vé.", variant: "destructive" });
        }
    };

    // Hàm format tên hạng vé
    const getTicketClassName = (ticketClass) => {
        if (!ticketClass) return 'N/A';
        const className = ticketClass.className || ticketClass;
        switch (className?.toUpperCase()) {
            case 'ECONOMY': return 'Economy (Phổ thông)';
            case 'PREMIUM_ECONOMY':
            case 'PREMIUM':
                return 'Premium Economy (Phổ thông đặc biệt)';
            case 'BUSINESS':
            case 'BUSINESS_CLASS':
            case 'BUSINESS_PREMIER':
                return 'Business (Thương gia)';
            default: return className;
        }
    };

    // Hàm lấy màu badge theo hạng vé
    const getClassBadgeColor = (ticketClass) => {
        const className = ticketClass?.className || ticketClass;
        switch (className?.toUpperCase()) {
            case 'BUSINESS':
            case 'BUSINESS_CLASS':
            case 'BUSINESS_PREMIER':
                return 'bg-amber-100 text-amber-800';
            case 'PREMIUM_ECONOMY':
            case 'PREMIUM':
                return 'bg-blue-100 text-blue-800';
            case 'ECONOMY': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                        <option key={f.id} value={String(f.id)}>{f.flightNumber} ({f.departureCity} - {f.arrivalCity})</option>
                    ))}
                </select>
            </div>
            
            {selectedFlightId && (
                <>
                    {isLoadingPrices ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                            <span>Đang tải giá vé...</span>
                        </div>
                    ) : flightPrices.length === 0 ? (
                        <div className="p-6 border border-dashed rounded-xl bg-yellow-50 text-center">
                            <p className="text-yellow-800 font-medium">Chuyến bay này chưa có giá vé được thiết lập.</p>
                            <p className="text-sm text-yellow-600 mt-1">Vui lòng thiết lập giá khi tạo chuyến bay.</p>
                        </div>
                    ) : (
                        <div className="border rounded-xl overflow-hidden shadow-md">
                            <TableHeader className="grid-cols-[2fr_2fr_2fr_2fr_1fr]">
                                <TableHead>HẠNG VÉ</TableHead>
                                <TableHead>GIÁ CƠ SỞ</TableHead>
                                <TableHead>THUẾ</TableHead>
                                <TableHead>TỔNG GIÁ VÉ</TableHead>
                                <TableHead>THAO TÁC</TableHead>
                            </TableHeader>
                            <TableBody>
                                {flightPrices.map((priceEntry, index) => {
                                    const basePrice = Number(priceEntry.basePrice ?? 0) || 0;
                                    const tax = Number(priceEntry.tax ?? 0) || 0;
                                    const totalPrice = basePrice + tax;

                                    return (
                                        <TableRow key={priceEntry.priceId || index} className="grid-cols-[2fr_2fr_2fr_2fr_1fr]">
                                            <TableCell>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getClassBadgeColor(priceEntry.ticketClass)}`}>
                                                    {getTicketClassName(priceEntry.ticketClass)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-orange-600 font-medium">{formatCurrency(basePrice)}</TableCell>
                                            <TableCell className="text-gray-600">{formatCurrency(tax)}</TableCell>
                                            <TableCell className="font-bold text-green-700 text-lg">{formatCurrency(totalPrice)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleEditPrice(priceEntry)}
                                                    className="h-8 px-3"
                                                >
                                                    <Edit className="w-3 h-3 mr-1" /> Sửa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </div>
                    )}

                    {/* Thông tin tổng hợp */}
                    {flightPrices.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2">Thông tin chuyến bay: {flightInfo?.flightNumber}</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {flightPrices.map((p, i) => (
                                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="font-semibold text-gray-700">{getTicketClassName(p.ticketClass)}</div>
                                        <div className="text-xs text-gray-500">Tổng ghế: {p.totalSeats || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">Còn trống: {p.availableSeats || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dialog chỉnh sửa giá vé */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Chỉnh sửa giá vé</DialogTitle>
                                <DialogDescription>
                                    {editingPrice && `Hạng vé: ${getTicketClassName(editingPrice.ticketClass)}`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="basePrice">Giá cơ sở (VND)</Label>
                                    <Input
                                        id="basePrice"
                                        type="number"
                                        value={editForm.basePrice}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, basePrice: e.target.value }))}
                                        placeholder="Nhập giá cơ sở"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tax">Thuế (VND)</Label>
                                    <Input
                                        id="tax"
                                        type="number"
                                        value={editForm.tax}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tax: e.target.value }))}
                                        placeholder="Nhập thuế"
                                    />
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-gray-600">Tổng giá vé:</div>
                                    <div className="text-xl font-bold text-blue-700">
                                        {formatCurrency(Number(editForm.basePrice || 0) + Number(editForm.tax || 0))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleSavePrice}>Lưu thay đổi</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
};

// ------------------------------------------
// --- Sub-Component: Quản lý Sơ đồ ghế (Dynamic từ API) ---
// ------------------------------------------
const SeatLayoutManagement = ({ flights, toast }) => {
    const [selectedFlightId, setSelectedFlightId] = useState('');
    const [seatList, setSeatList] = useState([]);
    const [numCols, setNumCols] = useState(6);
    const [aircraftName, setAircraftName] = useState('');
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);

    const handleFlightChange = async (flightId) => {
        setSelectedFlightId(flightId);
        if (!flightId) {
            setSeatList([]);
            return;
        }
        
        const flight = flights.find(f => String(f.id) === String(flightId));
        if (flight) {
            setAircraftName(flight.aircraft?.registrationNumber || flight.aircraft?.aircraftType?.typeName || 'N/A');
            setNumCols(flight.aircraft?.aircraftType?.numCols || 6);
            
            // Fetch chi tiết chuyến bay để lấy flightSeatList
            setIsLoadingSeats(true);
            try {
                const detailData = await getFlightById(flightId);
                const seats = detailData?.flightSeatList || [];
                setSeatList(seats);
            } catch (error) {
                console.error("Lỗi tải sơ đồ ghế:", error);
                setSeatList([]);
            } finally {
                setIsLoadingSeats(false);
            }
        }
    };

    // Parse row và col từ seatNumber (VD: "1A" -> row=1, col=1; "12F" -> row=12, col=6)
    const parseSeatPosition = (seatNumber) => {
        if (!seatNumber) return { row: 1, col: 1 };
        const match = seatNumber.match(/^(\d+)([A-Z])$/i);
        if (match) {
            const row = parseInt(match[1], 10);
            const col = match[2].toUpperCase().charCodeAt(0) - 64; // A=1, B=2, ...
            return { row, col };
        }
        return { row: 1, col: 1 };
    };

    const renderDynamicSeatMap = () => {
        if (seatList.length === 0) {
            return <div className="text-center text-gray-500 py-8">Chọn một chuyến bay để xem sơ đồ ghế</div>;
        }

        // Normalize seats với visualRow/visualCol, fallback parse từ seatNumber
        const normalizedSeats = seatList.map(seat => {
            let row = seat.visualRow;
            let col = seat.visualCol;
            
            // Nếu không có visualRow/visualCol hoặc = 0, parse từ seatNumber
            if (!row || !col) {
                const parsed = parseSeatPosition(seat.seatNumber);
                row = row || parsed.row;
                col = col || parsed.col;
            }
            return { ...seat, _row: row, _col: col };
        });

        // Tính numCols thực tế từ dữ liệu
        const maxCol = Math.max(...normalizedSeats.map(s => s._col), numCols);
        const effectiveNumCols = maxCol > 0 ? maxCol : 6;
        const halfCols = Math.floor(effectiveNumCols / 2);

        // Group seats by row
        const seatsByRow = {};
        normalizedSeats.forEach(seat => {
            const row = seat._row;
            if (!seatsByRow[row]) seatsByRow[row] = [];
            seatsByRow[row].push(seat);
        });

        const rows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);

        return rows.map(rowNum => {
            const rowSeats = seatsByRow[rowNum].sort((a, b) => a._col - b._col);
            
            return (
                <div key={rowNum} className="flex items-center space-x-2 mb-1">
                    <span className="w-6 text-xs font-bold text-gray-500 flex-shrink-0 text-right">{rowNum}</span>
                    <div className="flex">
                        {rowSeats.filter(s => s._col <= halfCols).map(seat => renderSeatCell(seat))}
                    </div>
                    <div className="w-8 text-center text-xs text-gray-400 flex-shrink-0">|</div>
                    <div className="flex">
                        {rowSeats.filter(s => s._col > halfCols).map(seat => renderSeatCell(seat))}
                    </div>
                </div>
            );
        });
    };

    const renderSeatCell = (seat) => {
        const seatClass = seat.seatClass || 'ECONOMY';
        const status = seat.status || 'Available';
        const seatNumber = seat.seatNumber || '';

        const baseStyle = "w-9 h-9 flex items-center justify-center m-0.5 rounded text-xs font-semibold border-2 transition-colors";
        let style = baseStyle;

        // Màu theo trạng thái
        if (status === 'Booked' || status === 'Locked') {
            style += ' bg-gray-400 text-white border-gray-500 cursor-not-allowed';
        } else {
            // Màu theo hạng ghế
            if (seatClass === 'BUSINESS_PREMIER' || seatClass === 'BUSINESS') {
                style += ' bg-amber-300 hover:bg-amber-400 text-amber-900 border-amber-500';
            } else if (seatClass === 'PREMIUM_ECONOMY') {
                style += ' bg-blue-300 hover:bg-blue-400 text-blue-900 border-blue-500';
            } else {
                style += ' bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border-yellow-400';
            }
        }

        return (
            <div 
                key={seat.flightSeatId || seatNumber} 
                className={style} 
                title={`${seatClass} - ${seatNumber} (${status})`}
            >
                {seatNumber.replace(/^\d+/, '')}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Chọn chuyến bay */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                <Label htmlFor="flightSelectLayout" className="mb-0 font-bold flex-shrink-0 text-lg">Chọn Chuyến bay:</Label>
                <select 
                    id="flightSelectLayout"
                    value={selectedFlightId} 
                    onChange={e => handleFlightChange(e.target.value)}
                    className="flex-1 p-3 border rounded-lg h-11 border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Chọn chuyến bay --</option>
                    {flights.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.flightNumber} • {f.departureAirportCode || ''} → {f.arrivalAirportCode || ''} • {f.flightDate || ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sơ đồ ghế */}
            <div className="p-4 border rounded-xl bg-white overflow-x-auto shadow-lg">
                <h4 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">
                    Sơ đồ Ghế {aircraftName && `- Tàu bay: ${aircraftName}`}
                </h4>
                <div className="min-w-[400px] flex justify-center py-4">
                    {isLoadingSeats ? (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    ) : (
                        <div className="space-y-1">
                            {renderDynamicSeatMap()}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center flex-wrap gap-4 text-sm font-medium">
                <Badge className="bg-amber-300 text-amber-900 border-amber-500">Business</Badge>
                <Badge className="bg-blue-300 text-blue-900 border-blue-500">Premium Economy</Badge>
                <Badge className="bg-yellow-200 text-yellow-900 border-yellow-400">Economy</Badge>
                <Badge className="bg-gray-400 text-white border-gray-500">Đã đặt</Badge>
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
    
    // --- Fetch chuyến bay từ API thực ---
    const fetchAllFlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllFlights();
            const flightList = Array.isArray(data) ? data : [];
            // Debug: log raw flight data
            console.log('Raw flights from API:', flightList.slice(0, 2));
            
            setFlights(flightList.map(f => {
                const schedule = f.schedule || f.flightSchedule || {};
                const departureDateTime = f.departureDateTime || null;
                const arrivalDateTime = f.arrivalDateTime || null;

                const flightNumber = schedule.flightNumber || f.flightNumber || `FL${f.flightId}`;
                const depCode = schedule.departureAirport?.airportCode || f.departureAirportCode || 'N/A';
                const arrCode = schedule.arrivalAirport?.airportCode || f.arrivalAirportCode || 'N/A';
                const depCity = schedule.departureAirport?.city || 'N/A';
                const arrCity = schedule.arrivalAirport?.city || 'N/A';

                const airlineName = schedule.airline?.airlineName || f.airline || 'N/A';
                const aircraftTypeName = f.aircraft?.aircraftType?.typeName || 'N/A';
                
                // Lấy flightSeatList và đếm ghế booked
                const seatList = f.flightSeatList || [];
                const bookedCount = seatList.filter(s => {
                    const status = String(s?.status || '').toUpperCase();
                    return status === 'BOOKED' || status === 'RESERVED' || status === 'SOLD';
                }).length;

                return {
                    id: f.flightId,
                    schedule,
                    flightNumber,
                    airlineName,
                    aircraftTypeName,
                    departureAirportCode: depCode,
                    arrivalAirportCode: arrCode,
                    departure: `${depCity} (${depCode}) - ${departureDateTime ? formatDate(departureDateTime) : 'N/A'}`,
                    arrival: `${arrCity} (${arrCode}) - ${arrivalDateTime ? formatDate(arrivalDateTime) : 'N/A'}`,
                    departureCity: depCity,
                    arrivalCity: arrCity,
                    ticketList: [],
                    totalSeats: f.aircraft?.aircraftType?.totalSeats || seatList.length || 0,
                    bookedSeats: bookedCount,
                    aircraftId: f.aircraft?.aircraftId,
                    aircraft: f.aircraft,
                    flightSeatList: seatList,
                    flightDate: f.flightDate,
                };
            }));
        } catch (error) {
            console.error("Lỗi tải chuyến bay:", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách chuyến bay.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const getTickets = async (flight) => {
        try {
            const ticketsData = await getTicketsByFlightId(flight.flightId);
            setTickets(Array.isArray(ticketsData) ? ticketsData : []);
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Lỗi tải vé:", error);
            setTickets([]);
            setIsDialogOpen(true);
            toast({ title: "Lỗi", description: "Không thể tải danh sách vé cho chuyến bay này.", variant: "destructive" });
        }
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
        fetchAllFlights();
    }, [fetchAllFlights]);

    // Hàm tiện ích tính vé đã bán - lấy từ API response
    const calculateSoldTickets = (flight) => {
        const total = flight.totalSeats || 0;
        const booked = flight.bookedSeats || 0;
        
        // Fallback: nếu API không trả về, đếm từ flightSeatList
        if (total === 0 && flight.flightSeatList) {
            const seatList = flight.flightSeatList || [];
            const bookedCount = seatList.filter(s => {
                const status = String(s?.status || '').toUpperCase();
                return status === 'BOOKED' || status === 'RESERVED' || status === 'SOLD';
            }).length;
            return { booked: bookedCount, total: seatList.length };
        }
        
        return { booked, total };
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
                                    isLoading={isLoading}
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
                                    flights={flights}
                                    toast={toast}
                                />
                            </TabsContent>
                            
                            {/* Tab 4: Quản lý Sơ đồ ghế (Dynamic từ API) */}
                            <TabsContent value="layout" activeTab={activeTab}>
                                <SeatLayoutManagement
                                    flights={flights}
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
