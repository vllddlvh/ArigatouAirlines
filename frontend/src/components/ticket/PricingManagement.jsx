import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog-admin';
import { getFlightPrices, createFlightPrice, updateFlightPrice } from '@/services/ticketsService';
import { useToast } from '@/hooks/use-toast';

export const PricingManagement = ({ classes = [], flights = [] }) => { // Default props là mảng rỗng để tránh lỗi
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
            // Đảm bảo data luôn là mảng
            setPrices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: "Không thể tải giá vé.", variant: "destructive" });
            setPrices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (priceData = null, classId = null) => {
        if (priceData) {
            setEditingPrice({
                flightPriceId: priceData.flightPriceId,
                flightId: selectedFlightId,
                ticketClassId: priceData.ticketClass?.classId, // Thêm ?.
                basePrice: priceData.basePrice,
                tax: priceData.tax,
                totalSeats: priceData.totalSeats,
                availableSeats: priceData.availableSeats,
                isNew: false
            });
        } else {
            setEditingPrice({
                flightId: parseInt(selectedFlightId),
                ticketClassId: classId,
                basePrice: 0,
                tax: 0,
                totalSeats: 50,
                availableSeats: 50,
                isNew: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSavePrice = async (e) => {
        e.preventDefault();
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
                toast({ title: "Thành công", description: "Đã thiết lập giá vé mới." });
            } else {
                await updateFlightPrice(editingPrice.flightPriceId, payload);
                toast({ title: "Thành công", description: "Đã cập nhật giá vé." });
            }
            setIsDialogOpen(false);
            fetchPrices(selectedFlightId);
        } catch (error) {
            toast({ title: "Lỗi", description: "Lưu thất bại.", variant: "destructive" });
        }
    };

    const formatCurrency = (amount) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '0 ₫';

    // --- SỬA LỖI Ở ĐÂY: Thêm Optional Chaining (?.) ---
    // Kiểm tra kỹ p (price), p.ticketClass trước khi gọi classId
    const classesWithoutPrice = classes.filter(c => 
        !prices.some(p => p?.ticketClass?.classId === c.classId)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                <Label className="mb-0 font-bold text-lg whitespace-nowrap">Chọn Chuyến bay:</Label>
                <select 
                    value={selectedFlightId} 
                    onChange={e => setSelectedFlightId(e.target.value)}
                    className="flex-1 p-2 border rounded-md h-10 bg-white"
                >
                    {flights.map(f => (
                        <option key={f.flightId} value={f.flightId}>
                            {f.schedule?.flightNumber || f.flightNumber}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                 <div className="text-center py-10"><Loader2 className="animate-spin inline-block text-blue-500 h-8 w-8" /></div>
            ) : (
                <>
                    <div className="border rounded-xl overflow-hidden shadow-md bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                    <TableHead className="font-bold">HẠNG VÉ</TableHead>
                                    <TableHead className="font-bold">GIÁ CƠ BẢN</TableHead>
                                    <TableHead className="font-bold">THUẾ & PHÍ</TableHead>
                                    <TableHead className="font-bold">TỔNG GIÁ</TableHead>
                                    <TableHead className="text-center font-bold">GHẾ (TRỐNG/TỔNG)</TableHead>
                                    <TableHead className="text-center font-bold">HÀNH ĐỘNG</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-gray-500">Chưa có cấu hình giá vé cho chuyến bay này.</TableCell>
                                    </TableRow>
                                ) : (
                                    prices.map(priceEntry => {
                                        const totalPrice = (priceEntry.basePrice || 0) + (priceEntry.tax || 0);
                                        return (
                                            <TableRow key={priceEntry.flightPriceId}>
                                                <TableCell className="font-semibold text-purple-600">
                                                    {/* Thêm ?. để tránh crash khi render nếu ticketClass null */}
                                                    {priceEntry.ticketClass?.className || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-orange-600 font-medium">
                                                    {formatCurrency(priceEntry.basePrice)}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {formatCurrency(priceEntry.tax)}
                                                </TableCell>
                                                <TableCell className="font-bold text-green-700 text-lg">
                                                    {formatCurrency(totalPrice)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-blue-600">{priceEntry.availableSeats}</span>
                                                    <span className="text-gray-400 mx-1">/</span>
                                                    <span className="font-medium">{priceEntry.totalSeats}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(priceEntry)}>
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

                    {classesWithoutPrice.length > 0 && (
                        <div className="p-4 border border-dashed rounded-xl bg-yellow-50/50 border-yellow-200">
                            <h4 className="font-bold text-yellow-800 mb-3 text-sm uppercase tracking-wide">Thiết lập giá cho các hạng còn thiếu:</h4>
                            <div className="flex flex-wrap gap-3">
                                {classesWithoutPrice.map(c => (
                                    <Button 
                                        key={c.classId} 
                                        className="bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-100 shadow-sm"
                                        onClick={() => handleOpenDialog(null, c.classId)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> {c.className}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPrice?.isNew ? 'Thiết lập Giá Vé Mới' : 'Cập nhật Giá Vé'}</DialogTitle>
                    </DialogHeader>
                    {editingPrice && (
                        <form onSubmit={handleSavePrice} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label className="text-gray-500 text-xs uppercase">Hạng vé</Label>
                                <div className="font-bold text-lg text-purple-700">
                                    {classes.find(c => c.classId === editingPrice.ticketClassId)?.className || 'Unknown'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Giá cơ bản (VNĐ)</Label>
                                    <Input 
                                        type="number" min="0" 
                                        value={editingPrice.basePrice} 
                                        onChange={e => setEditingPrice({...editingPrice, basePrice: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thuế & Phí (VNĐ)</Label>
                                    <Input 
                                        type="number" min="0" 
                                        value={editingPrice.tax} 
                                        onChange={e => setEditingPrice({...editingPrice, tax: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tổng số ghế mở bán</Label>
                                    <Input 
                                        type="number" min="1" 
                                        value={editingPrice.totalSeats} 
                                        onChange={e => setEditingPrice({...editingPrice, totalSeats: e.target.value})} 
                                        required 
                                    />
                                </div>
                                {!editingPrice.isNew && (
                                    <div className="space-y-2">
                                        <Label>Số ghế hiện còn trống</Label>
                                        <Input 
                                            type="number" min="0" 
                                            value={editingPrice.availableSeats} 
                                            onChange={e => setEditingPrice({...editingPrice, availableSeats: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Lưu thay đổi</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};