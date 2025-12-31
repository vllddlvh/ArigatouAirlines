import React, { useState, useEffect } from 'react';
import { Plane, Armchair, Loader2, Plus, RotateCcw, Save, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog-admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAircraftTypeWithLayout } from '@/services/ticketsService';
import { useToast } from '@/hooks/use-toast';

export const SeatLayoutManagement = ({ aircrafts = [] }) => {
    const { toast } = useToast();
    
    // --- 1. STATE QUẢN LÝ ---
    const [selectedAircraftId, setSelectedAircraftId] = useState(aircrafts[0]?.aircraftId || '');
    const [layoutData, setLayoutData] = useState(null); // Dữ liệu gốc từ API (để Reset)
    const [localSeats, setLocalSeats] = useState([]);   // Dữ liệu dùng để hiển thị và sửa (Giả lập)
    const [isLoading, setIsLoading] = useState(false);

    // State cho Dialog sửa ghế
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);

    // Tìm máy bay đang chọn để lấy info phụ
    const selectedAircraft = aircrafts.find(a => a.aircraftId == selectedAircraftId);

    // --- 2. FETCH DATA THẬT ---
    useEffect(() => {
        if (!selectedAircraftId && aircrafts.length > 0) {
            setSelectedAircraftId(aircrafts[0].aircraftId);
        }
    }, [aircrafts]);

    useEffect(() => {
        if (selectedAircraft?.aircraftType?.aircraftTypeId) {
            fetchLayout(selectedAircraft.aircraftType.aircraftTypeId);
        }
    }, [selectedAircraftId]);

    const fetchLayout = async (typeId) => {
        setIsLoading(true);
        try {
            const data = await getAircraftTypeWithLayout(typeId);
            setLayoutData(data); // Lưu gốc
            
            // Copy sang local state để thao tác giả lập
            if (data && data.listSeatMap) {
                setLocalSeats(data.listSeatMap);
            } else {
                setLocalSeats([]);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: "Không thể tải sơ đồ ghế.", variant: "destructive" });
            setLocalSeats([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. CÁC HÀM GIẢ LẬP (MOCK ACTIONS) ---

    // A. Thêm hàng ghế mới (Giả lập)
    const handleAddRowMock = () => {
        if (!layoutData) return;

        // Tìm hàng lớn nhất hiện tại
        const maxRow = localSeats.length > 0 
            ? Math.max(...localSeats.map(s => s.visualRow)) 
            : 0;
        const newRow = maxRow + 1;
        const cols = layoutData.numCols || 6; 
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K'].slice(0, cols);

        // Tạo các ghế mới (ID giả tạm thời)
        const newSeatsRow = letters.map((char, index) => ({
            seatMapId: `temp-${Date.now()}-${index}`, // ID giả
            seatNumber: `${newRow}${char}`,
            seatClass: 'ECONOMY', // Mặc định
            seatType: (index === 0 || index === cols - 1) ? 'WINDOW' : 'AISLE', // Logic đơn giản
            visualRow: newRow,
            visualCol: index + 1
        }));

        setLocalSeats(prev => [...prev, ...newSeatsRow]);
        toast({ title: "Giả lập", description: `Đã thêm hàng ghế số ${newRow} (Chưa lưu DB).` });
    };

    // B. Reset về dữ liệu gốc từ API
    const handleResetMock = () => {
        if (layoutData && layoutData.listSeatMap) {
            setLocalSeats(layoutData.listSeatMap);
            toast({ title: "Khôi phục", description: "Đã quay về sơ đồ gốc từ Server." });
        }
    };

    // C. Mở dialog sửa ghế
    const handleSeatClick = (seat) => {
        setEditingSeat({ ...seat }); // Clone object để sửa không ảnh hưởng ngay
        setIsDialogOpen(true);
    };

    // D. Lưu sửa ghế (Giả lập)
    const handleSaveSeatMock = () => {
        setLocalSeats(prev => prev.map(s => s.seatMapId === editingSeat.seatMapId ? editingSeat : s));
        setIsDialogOpen(false);
        toast({ title: "Giả lập", description: `Đã cập nhật thông tin ghế ${editingSeat.seatNumber}.` });
    };

    // E. Xóa ghế (Giả lập)
    const handleDeleteSeatMock = () => {
        setLocalSeats(prev => prev.filter(s => s.seatMapId !== editingSeat.seatMapId));
        setIsDialogOpen(false);
        toast({ title: "Giả lập", description: `Đã xóa ghế ${editingSeat.seatNumber}.`, variant: "destructive" });
    };

    // --- 4. RENDER MAP ---
    const renderSeatMap = () => {
        if (localSeats.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                    <Armchair className="w-12 h-12 mb-3 opacity-20" />
                    <p>Chưa có ghế nào. Hãy thử thêm hàng ghế.</p>
                </div>
            );
        }
        
        // Nhóm theo hàng (Row)
        const rowsMap = {};
        let maxRow = 0;
        localSeats.forEach(seat => {
            const rowNum = seat.visualRow;
            if (!rowsMap[rowNum]) rowsMap[rowNum] = [];
            rowsMap[rowNum].push(seat);
            if (rowNum > maxRow) maxRow = rowNum;
        });

        const renderRows = [];
        for (let r = 1; r <= maxRow; r++) {
            const seatsInRow = rowsMap[r] || [];
            seatsInRow.sort((a, b) => a.visualCol - b.visualCol);

            // Render từng ghế
            const rowElements = seatsInRow.map(seat => {
                let style = "w-9 h-9 flex items-center justify-center m-1 rounded-t-lg rounded-b-md text-[10px] font-bold border cursor-pointer transition-all shadow-sm relative ";
                
                // Style giả lập trạng thái & hạng ghế
                if (seat.seatClass === 'BUSINESS_PREMIER' || seat.seatClass === 'BUSINESS') {
                    style += 'bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200 hover:-translate-y-1';
                } else if (seat.seatClass === 'ECONOMY') {
                    style += 'bg-blue-100 text-blue-800 border-blue-400 hover:bg-blue-200 hover:-translate-y-1';
                } else {
                    style += 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
                }

                return (
                    <div key={seat.seatMapId} className={style} onClick={() => handleSeatClick(seat)}>
                        {seat.seatNumber}
                        {/* Hiệu ứng tay vịn ghế */}
                        <div className="absolute -bottom-1 w-full h-1 bg-current opacity-20 rounded-full"></div>
                    </div>
                );
            });

            // Chia đôi hàng ghế để tạo lối đi
            const midIndex = Math.ceil(rowElements.length / 2);
            const leftSide = rowElements.slice(0, midIndex);
            const rightSide = rowElements.slice(midIndex);

            renderRows.push(
                <div key={r} className="flex items-center justify-center mb-2">
                    <span className="w-6 text-xs font-bold text-gray-400 mr-3 text-right font-mono">{r}</span>
                    <div className="flex gap-0.5">{leftSide}</div>
                    {/* Lối đi giả lập */}
                    <div className="w-10 text-center text-[8px] text-gray-300 flex items-center justify-center px-1">
                        <span className="transform -rotate-90 tracking-widest opacity-50">AISLE</span>
                    </div>
                    <div className="flex gap-0.5">{rightSide}</div>
                </div>
            );
        }

        return <div className="flex flex-col items-center py-4">{renderRows}</div>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* --- THANH CÔNG CỤ (Header Controls) --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Plane className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <Label className="text-xs text-gray-500 uppercase font-semibold">Chọn Tàu Bay (API)</Label>
                        <select 
                            className="w-full md:w-64 mt-1 font-bold text-gray-800 bg-transparent border-none focus:ring-0 cursor-pointer text-lg p-0"
                            value={selectedAircraftId} 
                            onChange={e => setSelectedAircraftId(e.target.value)}
                        >
                            {aircrafts.map(a => (
                                <option key={a.aircraftId} value={a.aircraftId}>
                                    {a.registrationNumber} - {a.aircraftType?.typeName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50" onClick={handleResetMock}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Khôi phục gốc
                    </Button>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md" onClick={handleAddRowMock}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm hàng ghế
                    </Button>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => toast({title: "Lưu (Mock)", description: "Tính năng lưu xuống DB chưa được kích hoạt."})}>
                        <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                    </Button>
                </div>
            </div>

            {/* --- KHU VỰC HIỂN THỊ SƠ ĐỒ (Fuselage UI) --- */}
            <div className="flex justify-center py-6">
                {/* Khung thân máy bay */}
                <div className="relative bg-white p-8 pt-16 rounded-[4rem] border-4 border-slate-100 shadow-2xl min-w-[380px] max-w-[600px] transition-all duration-300">
                    
                    {/* Trang trí buồng lái */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-slate-100 to-white rounded-t-full border-4 border-b-0 border-slate-100 -z-10 opacity-80"></div>
                    
                    {/* Info Stats */}
                    {layoutData && (
                        <div className="flex justify-between text-xs text-slate-400 mb-6 px-4 font-mono uppercase tracking-wider border-b border-dashed border-slate-200 pb-2">
                            <span>Type: {layoutData.typeName}</span>
                            <span>Total: {localSeats.length} Seats</span>
                        </div>
                    )}

                    <div className="relative z-10 min-h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
                                <span className="text-sm text-gray-500">Đang tải dữ liệu thực...</span>
                            </div>
                        ) : (
                            renderSeatMap()
                        )}
                    </div>

                    {/* Trang trí đuôi */}
                    <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-4 text-center">
                        <span className="text-[10px] text-slate-300 font-bold tracking-[0.5em]">REAR</span>
                    </div>
                </div>
            </div>

            {/* --- CHÚ THÍCH (Legend) --- */}
            <div className="flex justify-center gap-6 py-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
                    <span className="text-sm font-medium text-slate-600">Thương gia (Business)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                    <span className="text-sm font-medium text-slate-600">Phổ thông (Economy)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                    <span className="text-sm font-medium text-slate-600">Khác</span>
                </div>
            </div>

            {/* --- DIALOG CHỈNH SỬA GHẾ (MOCK) --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            <Armchair className="w-5 h-5 text-blue-600" />
                            Cấu hình ghế {editingSeat?.seatNumber}
                        </DialogTitle>
                    </DialogHeader>
                    {editingSeat && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hạng ghế</Label>
                                    <Select 
                                        value={editingSeat.seatClass} 
                                        onValueChange={(val) => setEditingSeat({...editingSeat, seatClass: val})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUSINESS_PREMIER">Thương gia</SelectItem>
                                            <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                                            <SelectItem value="OTHER">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Loại ghế</Label>
                                    <Select 
                                        value={editingSeat.seatType} 
                                        onValueChange={(val) => setEditingSeat({...editingSeat, seatType: val})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WINDOW">Cửa sổ</SelectItem>
                                            <SelectItem value="AISLE">Lối đi</SelectItem>
                                            <SelectItem value="MIDDLE">Giữa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Số ghế (Visual)</Label>
                                <Input 
                                    value={editingSeat.seatNumber} 
                                    onChange={(e) => setEditingSeat({...editingSeat, seatNumber: e.target.value})}
                                />
                            </div>
                            
                            <DialogFooter className="flex justify-between sm:justify-between mt-4">
                                <Button type="button" variant="destructive" size="sm" onClick={handleDeleteSeatMock}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa ghế
                                </Button>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                    <Button type="button" onClick={handleSaveSeatMock} className="bg-blue-600 hover:bg-blue-700">Cập nhật</Button>
                                </div>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};