import React, { useState, useEffect, useCallback } from 'react';
// Icons from Lucide for a modern look
import { Search, Plus, Edit, Trash2, Loader2, Zap, ZapOff, XCircle, CheckCircle, Clock, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter  } from '@/components/ui/dialog-admin';
import { useToast } from '@/hooks/use-toast';
import { getAllVouchers as fetchAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '@/services/voucherService';



// --- Dữ liệu Mock (Giả) ---
const MOCK_VOUCHERS = [
    {
        id: 'VC001',
        code: 'SUMMER20',
        discount: 20, // percentage
        maxUses: 100,
        usedCount: 45,
        isActive: true,
        expiresAt: '2025-08-31',
        createdAt: '2025-06-01'
    },
    {
        id: 'VC002',
        code: 'FREESHIP',
        discount: 100, // percentage (for simplicity, keeping it as percent)
        maxUses: 50,
        usedCount: 50, // Đã hết lượt dùng
        isActive: true,
        expiresAt: '2025-10-30',
        createdAt: '2025-07-15'
    },
    {
        id: 'VC003',
        code: 'NEWUSER10',
        discount: 10,
        maxUses: 200,
        usedCount: 120,
        isActive: false, // Đang vô hiệu hóa
        expiresAt: '2025-12-31',
        createdAt: '2025-09-01'
    }
];

// --- Hàm tiện ích ---
const formatDiscount = (discount) => {
    // Giả định tất cả đều là % cho đơn giản
    return `${discount}%`;
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Đảm bảo định dạng yyyy-mm-dd
    return new Date(dateString).toLocaleDateString('vi-VN');
};
// ----------------------------


// ===========================================
// MAIN COMPONENT
// ===========================================

function VoucherManagementDashboard() {
    const { toast } =useToast();

    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState({
        code: '', discount: 0, maxUses: 0, expiresAt: ''
    });

    // --- Mock: Lấy danh sách Voucher ---
    const getAllVouchers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllVouchers();
            const list = Array.isArray(data) ? data : [];
            setVouchers(
                list.map((v) => ({
                    id: v.voucherId,
                    code: v.voucherCode,
                    discount: Number(v.discountValue ?? 0),
                    maxUses: Number(v.usageLimit ?? 0),
                    usedCount: Number(v.usedCount ?? 0),
                    isActive: Boolean(v.isActive ?? true),
                    expiresAt: String(v.validTo || '').split('T')[0] || '',
                    createdAt: String(v.validFrom || '').split('T')[0] || '',
                    discountType: v.discountType,
                    maxDiscountAmount: v.maxDiscountAmount,
                    minOrderAmount: v.minOrderAmount,
                }))
            );
        } catch (error) {
            const msg = error?.response?.data?.message || "Không thể tải danh sách voucher. Hãy đảm bảo bạn đã đăng nhập admin.";
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // --- Mock: Thêm/Sửa Voucher ---
    const handleSaveVoucher = async (e) => {
        e.preventDefault();
        
        const { code, discount, maxUses, expiresAt } = formState;

        // Simple validation
        if (!code.trim() || discount <= 0 || maxUses <= 0 || !expiresAt) {
            toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ và chính xác thông tin.", variant: "destructive" });
            return;
        }

        const pad2 = (n) => String(n).padStart(2, '0');
        const toLocalDateTimeString = (d) =>
            `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

        const toValidTo = (dateStr) => {
            const parts = String(dateStr || '').split('-').map((x) => Number(x));
            if (parts.length !== 3 || parts.some((x) => Number.isNaN(x))) return null;
            const [y, m, d] = parts;
            return toLocalDateTimeString(new Date(y, m - 1, d, 23, 59, 59));
        };

        const payload = {
            voucherCode: code.trim(),
            discountType: "Percentage",
            discountValue: Number(discount),
            maxDiscountAmount: 0,
            minOrderAmount: 0,
            usageLimit: Number(maxUses),
            validTo: toValidTo(expiresAt),
            isActive: true,
        };

        try {
            if (isEditing) {
                await updateVoucher(editingVoucher.id, { ...payload, isActive: editingVoucher.isActive });
                toast({ title: "Thành công", description: `Voucher ${code} đã được cập nhật.`, variant: "success" });
            } else {
                await createVoucher({ ...payload, validFrom: toLocalDateTimeString(new Date()) });
                toast({ title: "Thành công", description: `Voucher ${code} đã được tạo mới.`, variant: "success" });
            }
            setIsDialogOpen(false);
            await getAllVouchers();
        } catch (error) {
            const msg = error?.response?.data?.message || "Tạo/cập nhật voucher thất bại. Hãy kiểm tra quyền ADMIN và dữ liệu nhập.";
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        }
    };

    // --- Mock: Xóa Voucher ---
    const handleDeleteVoucher = async (id, code) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher ${code}?`)) return;

        try {
            await deleteVoucher(id);
            setVouchers(vouchers.filter(v => v.id !== id));
            toast({ title: "Thành công", description: `Voucher ${code} đã được xóa.`, variant: "success" });
        } catch (error) {
            const msg = error?.response?.data?.message || "Xóa voucher thất bại. Hãy kiểm tra quyền ADMIN.";
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        }
    };

    // --- Mock: Kích hoạt/Vô hiệu hóa Voucher ---
    const handleToggleActive = async (id, code, currentState) => {
        const current = vouchers.find((v) => v.id === id);
        if (!current) return;

        const pad2 = (n) => String(n).padStart(2, '0');
        const toLocalDateTimeString = (d) =>
            `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
        const toValidTo = (dateStr) => {
            const parts = String(dateStr || '').split('-').map((x) => Number(x));
            if (parts.length !== 3 || parts.some((x) => Number.isNaN(x))) return null;
            const [y, m, d] = parts;
            return toLocalDateTimeString(new Date(y, m - 1, d, 23, 59, 59));
        };

        const payload = {
            voucherCode: current.code,
            discountType: "Percentage",
            discountValue: Number(current.discount),
            maxDiscountAmount: 0,
            minOrderAmount: 0,
            usageLimit: Number(current.maxUses),
            validTo: toValidTo(current.expiresAt),
            isActive: !currentState,
        };

        try {
            await updateVoucher(id, payload);
            setVouchers(vouchers.map(v => v.id === id ? { ...v, isActive: !currentState } : v));
            toast({
                title: "Thành công",
                description: `Voucher ${code} đã được ${!currentState ? 'kích hoạt' : 'vô hiệu hóa'}.`,
                variant: "success"
            });
        } catch (error) {
            const msg = error?.response?.data?.message || "Cập nhật trạng thái voucher thất bại. Hãy kiểm tra quyền ADMIN.";
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        }
    };

    // --- Logic UI ---
    useEffect(() => {
        getAllVouchers();
    }, [getAllVouchers]);

    const handleOpenEditDialog = (voucher) => {
        setIsEditing(true);
        setEditingVoucher(voucher);
        setFormState({
            code: voucher.code,
            discount: voucher.discount,
            maxUses: voucher.maxUses,
            expiresAt: voucher.expiresAt // already in yyyy-mm-dd format from fetch
        });
        setIsDialogOpen(true);
    };

    const handleOpenAddDialog = () => {
        setIsEditing(false);
        setEditingVoucher(null);
        // Set default expiresAt to next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        setFormState({ 
            code: '', 
            discount: 0, 
            maxUses: 100, 
            expiresAt: nextMonth.toISOString().split('T')[0]
        });
        setIsDialogOpen(true);
    };

    const filteredVouchers = vouchers.filter(v => 
        v.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (voucher) => {
        const today = new Date().toISOString().split('T')[0];
        const isExpired = voucher.expiresAt < today;
        const isFullyUsed = voucher.usedCount >= voucher.maxUses;
        
        if (!voucher.isActive) {
            return <Badge variant="warning" className="bg-gray-200 text-gray-700">Vô hiệu hóa</Badge>;
        }
        if (isExpired) {
             return <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center"><Clock className="w-3 h-3 mr-1"/> Hết hạn</Badge>;
        }
        if (isFullyUsed) {
            return <Badge variant="destructive" className="bg-red-100 text-red-800">Hết lượt dùng</Badge>;
        }
        return <Badge variant="success">Đang hoạt động</Badge>;
    };
    
    // --- Custom Row Component ---
    const VoucherTableRow = ({ voucher }) => {
        const status = getStatusBadge(voucher);
        const isInactive = !voucher.isActive || voucher.usedCount >= voucher.maxUses || new Date(voucher.expiresAt) < new Date();
        
        return (
            <div 
                key={voucher.id}
                className={`grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_1fr] items-center p-4 border-b transition-colors text-sm
                    ${isInactive ? 'bg-gray-50 opacity-80' : 'hover:bg-blue-50'}`}
            >
                <div className={`font-semibold ${isInactive ? 'text-gray-500' : 'text-blue-700'}`}>{voucher.code}</div>
                <div className="text-gray-600 font-medium">{formatDiscount(voucher.discount)}</div>
                <div className="text-gray-600">{voucher.usedCount} / {voucher.maxUses}</div>
                <div className={`text-gray-600 ${new Date(voucher.expiresAt) < new Date() ? 'text-red-500 font-medium' : ''}`}>
                    {formatDate(voucher.expiresAt)}
                </div>
                <div className="flex justify-center">{status}</div>
                
                {/* Actions Cell */}
                <div className="flex space-x-2 justify-center">
                    <Button 
                        variant="outline" 
                        size="sm"
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEditDialog(voucher)}
                        disabled={!voucher.isActive || voucher.usedCount >= voucher.maxUses}
                    >
                        <Edit className="h-4 w-4 text-gray-700" />
                    </Button>
                    
                    <Button 
                        variant={voucher.isActive ? "warning" : "success"} 
                        size="sm"
                        title={voucher.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        onClick={() => handleToggleActive(voucher.id, voucher.code, voucher.isActive)}
                    >
                        {voucher.isActive ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    </Button>
                    
                    <Button 
                        variant="destructive" 
                        size="sm"
                        title="Xóa voucher"
                        onClick={() => handleDeleteVoucher(voucher.id, voucher.code)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Quản Lý Mã Giảm Giá
                    </h1>
                    <p className="text-gray-500 mt-1">Tạo, chỉnh sửa, và quản lý trạng thái của các mã khuyến mãi.</p>
                </header>

                {/* Toolbar (Search & Add) */}
                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="flex w-full sm:w-auto space-x-2">
                        <Input
                            placeholder="Tìm kiếm theo mã voucher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs flex-grow"
                        />
                        <Button variant="primary" className="p-2 h-10 w-10 sm:w-auto">
                            <Search className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Tìm</span>
                        </Button>
                    </div>
                    
                    <Button 
                        variant="primary"
                        className="w-full sm:w-auto h-10 text-base tracking-wide bg-green-600 hover:bg-green-700"
                        onClick={handleOpenAddDialog}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        TẠO VOUCHER MỚI
                    </Button>
                </div>

                {/* Voucher List Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                            <span className="text-lg font-medium">Đang tải danh sách voucher...</span>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[800px]"> 
                                {/* Table Header (Using Grid for flexibility) */}
                                <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_1fr] p-4 font-bold text-xs uppercase tracking-wider text-gray-700 bg-gray-100 border-b border-gray-200">
                                    <div className="truncate">MÃ VOUCHER</div>
                                    <div className="truncate">MỨC GIẢM</div>
                                    <div className="truncate">ĐÃ DÙNG / TỔNG</div>
                                    <div className="truncate">HẾT HẠN</div>
                                    <div className="text-center truncate">TRẠNG THÁI</div>
                                    <div className="text-center">THAO TÁC</div>
                                </div>
                            </div>
                            
                            <div className="min-w-[800px]">
                                {filteredVouchers.length === 0 ? (
                                    <div className="h-32 flex flex-col items-center justify-center text-gray-500 p-4">
                                        <UserX className="w-6 h-6 mb-2" />
                                        <span className="text-base">Không tìm thấy mã giảm giá nào.</span>
                                    </div>
                                ) : (
                                    filteredVouchers.map(voucher => (
                                        <VoucherTableRow key={voucher.id} voucher={voucher} />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dialog Thêm/Sửa Voucher */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Sửa Voucher' : 'Tạo Voucher Mới'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveVoucher} className="space-y-4">
                            <div>
                                <Label htmlFor="code">Mã Voucher</Label>
                                <Input
                                    id="code"
                                    value={formState.code}
                                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                                    required
                                    disabled={isEditing} // Không cho sửa mã code khi chỉnh sửa
                                />
                            </div>
                            <div>
                                <Label htmlFor="discount">Mức giảm (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="Ví dụ: 20"
                                    value={formState.discount}
                                    onChange={(e) => setFormState({ ...formState, discount: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxUses">Số lượt sử dụng tối đa</Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    min="1"
                                    placeholder="Ví dụ: 100"
                                    value={formState.maxUses}
                                    onChange={(e) => setFormState({ ...formState, maxUses: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="expiresAt">Ngày hết hạn</Label>
                                <Input
                                    id="expiresAt"
                                    type="date"
                                    value={formState.expiresAt}
                                    onChange={(e) => setFormState({ ...formState, expiresAt: e.target.value })}
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                <Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Tạo Voucher'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// Export as App is required for the single-file React component convention
export default VoucherManagementDashboard;
