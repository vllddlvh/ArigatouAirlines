import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog-admin';
import { getFlightPrices, createFlightPrice, updateFlightPriceByClass } from '@/services/ticketsService';
import { useToast } from '@/hooks/use-toast';

export const PricingManagement = ({ classes = [], flights = [] }) => {
    const { toast } = useToast();
    
    const [selectedFlightId, setSelectedFlightId] = useState(flights[0]?.flightId || '');
    const [prices, setPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);

    useEffect(() => {
        if (!selectedFlightId && flights.length > 0) {
            setSelectedFlightId(flights[0].flightId);
        }
    }, [flights]);


    useEffect(() => {
        if (selectedFlightId) {
            fetchPrices(selectedFlightId);
        }
    }, [selectedFlightId]);

    const fetchPrices = async (flightId) => {
        setIsLoading(true);
        try {
            const data = await getFlightPrices(flightId);
            console.log(data)
            setPrices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải giá:", error);
            toast({ title: "Lỗi", description: "Không thể tải cấu hình giá vé.", variant: "destructive" });
            setPrices([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Mở Dialog (Tạo mới hoặc Sửa)
    const handleOpenDialog = (priceData = null, classId = null) => {
        if (priceData) {
            // --- TRƯỜNG HỢP SỬA ---
            setEditingPrice({
                flightPriceId: priceData.flightPriceId,
                flightId: selectedFlightId,
                ticketClassId: priceData.ticketClass?.classId,
                basePrice: priceData.basePrice,
                tax: priceData.tax,
                totalSeats: priceData.totalSeats,
                availableSeats: priceData.availableSeats,
                isNew: false
            });
        } else {
            // --- TRƯỜNG HỢP TẠO MỚI ---
            setEditingPrice({
                flightId: parseInt(selectedFlightId),
                ticketClassId: classId,
                basePrice: 0,
                tax: 0,
                totalSeats: 100, // Mặc định gợi ý
                availableSeats: 100,
                isNew: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSavePrice = async (e) => {
        e.preventDefault();
        
        // Payload khớp với FlightPriceRequest
        const payload = {
            flightId: editingPrice.flightId,
            ticketClassId: editingPrice.ticketClassId,
            basePrice: parseFloat(editingPrice.basePrice),
            tax: parseFloat(editingPrice.tax),
            totalSeats: parseInt(editingPrice.totalSeats),
            availableSeats: parseInt(editingPrice.isNew ? editingPrice.totalSeats : editingPrice.availableSeats)
        };

        try {
            if (editingPrice.isNew) {
                await createFlightPrice(payload);
                toast({ title: "Thành công", description: "Đã thêm giá cho hạng vé mới." });
            } else {
                await updateFlightPriceByClass(
                    editingPrice.flightId,      
                    editingPrice.ticketClassId, 
                    payload                   
                );
                toast({ title: "Thành công", description: "Đã cập nhật giá vé." });
            }
            setIsDialogOpen(false);
            fetchPrices(selectedFlightId); 
        } catch (error) {
            toast({ title: "Lỗi", description: "Lưu dữ liệu thất bại.", variant: "destructive" });
        }
    };

    const formatCurrency = (amount) => {
        return amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '0 ₫';
    };

    const classesWithoutPrice = classes.filter(c => 
        !prices.some(p => p.ticketClass?.classId === c.classId)
    );

    return (
        <div className="space-y-6">
            {/* --- 1. SELECT CHUYẾN BAY --- */}
            <div className="flex items-center space-x-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Label className="mb-0 font-bold text-base text-gray-700 whitespace-nowrap">
                    Đang cấu hình cho chuyến bay:
                </Label>
                <select 
                    value={selectedFlightId} 
                    onChange={e => setSelectedFlightId(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                >
                    {flights.map(f => {
                        // Truy xuất thông tin từ JSON lồng nhau của Flight
                        const flightNum = f.schedule?.flightNumber || "N/A";
                        const dep = f.schedule?.departureAirport?.city || "Unknown";
                        const arr = f.schedule?.arrivalAirport?.city || "Unknown";
                        const date = f.flightDate || "N/A";
                        
                        return (
                            <option key={f.flightId} value={f.flightId}>
                                {flightNum} ({dep} ➝ {arr}) - {date}
                            </option>
                        );
                    })}
                </select>
            </div>

            {isLoading ? (
                 <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
            ) : (
                <>
                    {/* --- 2. BẢNG GIÁ VÉ ĐÃ CÓ --- */}
                    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                    <TableHead className="font-bold text-gray-700">HẠNG VÉ</TableHead>
                                    <TableHead className="font-bold text-gray-700">GIÁ CƠ BẢN</TableHead>
                                    <TableHead className="font-bold text-gray-700">THUẾ & PHÍ</TableHead>
                                    <TableHead className="font-bold text-gray-700">TỔNG CỘNG</TableHead>
                                    <TableHead className="text-center font-bold text-gray-700">GHẾ (TRỐNG/TỔNG)</TableHead>
                                    <TableHead className="text-center font-bold text-gray-700 w-[100px]">THAO TÁC</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-32 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="h-6 w-6 text-gray-300" />
                                                <span>Chưa có cấu hình giá vé nào cho chuyến bay này.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    prices.map(priceEntry => {
                                        // Tính toán hiển thị
                                        const base = priceEntry.basePrice || 0;
                                        const tax = priceEntry.tax || 0;
                                        const total = base + tax;

                                        return (
                                            <TableRow key={priceEntry.flightPriceId} className="hover:bg-blue-50/50 transition-colors">
                                                <TableCell className="font-bold text-purple-700">
                                                    {priceEntry.ticketClass?.className || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-600 font-medium font-mono">
                                                    {formatCurrency(base)}
                                                </TableCell>
                                                <TableCell className="text-gray-600 font-medium font-mono">
                                                    {formatCurrency(tax)}
                                                </TableCell>
                                                <TableCell className="font-bold text-green-700 text-base font-mono">
                                                    {formatCurrency(total)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-blue-600">{priceEntry.availableSeats}</span>
                                                    <span className="text-gray-400 mx-1">/</span>
                                                    <span className="font-medium text-gray-600">{priceEntry.totalSeats}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(priceEntry)}>
                                                        <DollarSign className="h-4 w-4 mr-1" /> Sửa
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- 3. GỢI Ý CÁC HẠNG VÉ CHƯA SET --- */}
                    {classesWithoutPrice.length > 0 && (
                        <div className="p-5 border border-dashed border-yellow-300 rounded-xl bg-yellow-50/60">
                            <h4 className="font-bold text-yellow-800 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Thiết lập giá cho các hạng còn thiếu:
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {classesWithoutPrice.map(c => (
                                    <Button 
                                        key={c.classId} 
                                        className="bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400 shadow-sm transition-all"
                                        onClick={() => handleOpenDialog(null, c.classId)}
                                    >
                                        + {c.className}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- 4. DIALOG FORM --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-blue-700">
                            {editingPrice?.isNew ? 'Thiết lập Giá Vé Mới' : 'Cập nhật Giá & Ghế'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {editingPrice && (
                        <form onSubmit={handleSavePrice} className="space-y-5 py-2">
                            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                                <Label className="text-gray-500 text-xs uppercase font-bold">Đang cấu hình cho hạng vé</Label>
                                <div className="font-extrabold text-xl text-gray-800 mt-1">
                                    {/* Tìm tên hạng vé để hiển thị */}
                                    {classes.find(c => c.classId === editingPrice.ticketClassId)?.className || 'Unknown Class'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Giá cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                                    <Input 
                                        type="number" min="0" step="1000"
                                        className="font-mono"
                                        value={editingPrice.basePrice} 
                                        onChange={e => setEditingPrice({...editingPrice, basePrice: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Thuế & Phí (VNĐ)</Label>
                                    <Input 
                                        type="number" min="0" step="1000"
                                        className="font-mono"
                                        value={editingPrice.tax} 
                                        onChange={e => setEditingPrice({...editingPrice, tax: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Tổng số ghế mở bán <span className="text-red-500">*</span></Label>
                                    <Input 
                                        type="number" min="1" 
                                        value={editingPrice.totalSeats} 
                                        onChange={e => setEditingPrice({...editingPrice, totalSeats: e.target.value})} 
                                        required 
                                    />
                                </div>
                                
                                {/* Chỉ hiện ô nhập ghế trống khi đang Edit, còn New thì tự động = Total */}
                                {!editingPrice.isNew && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Số ghế hiện còn trống</Label>
                                        <Input 
                                            type="number" min="0" max={editingPrice.totalSeats}
                                            value={editingPrice.availableSeats} 
                                            onChange={e => setEditingPrice({...editingPrice, availableSeats: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="pt-4 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
                                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 px-6">Lưu thay đổi</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};