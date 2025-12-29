import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Zap, ZapOff, UserX, Calculator, DollarSign, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog-admin';
import { useToast } from '@/hooks/use-toast';
import {
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher
} from "@/services/voucherService";


const DISCOUNT_TYPE_NUMBER_MAP = {
    Percentage: 0,
    Fixed: 1,
    Amount: 2
};
// --- Hàm tiện ích định dạng tiền tệ ---
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// --- Hàm hiển thị nội dung giảm giá thông minh ---
const renderDiscountInfo = (voucher) => {
    if (voucher.discountType === 'Percentage') {
        return (
            <div className="flex flex-col">
                <span className="font-bold text-blue-600">{voucher.discountValue}%</span>
                {voucher.maxDiscountAmount > 0 && (
                    <span className="text-xs text-gray-500">
                        Tối đa: {formatCurrency(voucher.maxDiscountAmount)}
                    </span>
                )}
            </div>
        );
    } else {
        return (
            <span className="font-bold text-green-600">
                {formatCurrency(voucher.discountValue)}
            </span>
        );
    }
};

// ===========================================
// MAIN COMPONENT
// ===========================================

function VoucherManagementDashboard() {
    const { toast } = useToast();

    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- State Form khớp 100% với VoucherRequest DTO ---
    const [formState, setFormState] = useState({
        voucherCode: '',
        discountType: 'Percentage', 
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderAmount: 0,
        usageLimit: 0
    });

    const getAllVouchersData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllVouchers();
            // Backend trả về VoucherResponse, ta set trực tiếp
            setVouchers(data);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách voucher",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        getAllVouchersData();
    }, [getAllVouchersData]);

    // --- Xử lý Submit Form ---
    const handleSaveVoucher = async (e) => {
        e.preventDefault();

        // Validation cơ bản
        if (!formState.voucherCode.trim() || formState.discountValue <= 0 || formState.usageLimit <= 0) {
            toast({
                title: "Cảnh báo",
                description: "Vui lòng nhập Mã, Giá trị giảm và Giới hạn sử dụng hợp lệ.",
                variant: "destructive",
            });
            return;
        }

        // Tạo object đúng chuẩn VoucherRequest
        const voucherRequest = {
            voucherCode: formState.voucherCode,
            discountType: DISCOUNT_TYPE_NUMBER_MAP[formState.discountType],
            discountValue: parseFloat(formState.discountValue),
            maxDiscountAmount: parseFloat(formState.maxDiscountAmount) || 0,
            minOrderAmount: parseFloat(formState.minOrderAmount) || 0,
            usageLimit: parseInt(formState.usageLimit)
        };

        try {
            if (isEditing) {
                console.log(editingVoucherId)
                await updateVoucher(editingVoucherId, voucherRequest);
                toast({ title: "Thành công", description: "Đã cập nhật voucher!" });
            } else {
                await createVoucher(voucherRequest);
                toast({ title: "Thành công", description: "Đã tạo voucher mới!" });
            }
            setIsDialogOpen(false);
            getAllVouchersData();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Có lỗi xảy ra khi lưu.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteVoucher = async (id, code) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher ${code}?`)) return;
        try {
            await deleteVoucher(id);
            toast({ title: "Thành công", description: "Đã xóa voucher" });
            getAllVouchersData();
        } catch (error) {
            toast({ title: "Lỗi", description: "Xóa thất bại", variant: "destructive" });
        }
    };

    // --- Mở form Edit ---
    const handleOpenEditDialog = (voucher) => {
        setIsEditing(true);
        setEditingVoucherId(voucher.voucherId); 
        setFormState({
            voucherCode: voucher.voucherCode,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            maxDiscountAmount: voucher.maxDiscountAmount,
            minOrderAmount: voucher.minOrderAmount,
            usageLimit: voucher.usageLimit
        });
        setIsDialogOpen(true);
    };

 
    const handleOpenAddDialog = () => {
        setIsEditing(false);
        setEditingVoucherId(null);
        setFormState({
            voucherCode: '',
            discountType: 'Percentage',
            discountValue: 0,
            maxDiscountAmount: 0,
            minOrderAmount: 0,
            usageLimit: 100
        });
        setIsDialogOpen(true);
    };

    const filteredVouchers = vouchers.filter(v => 
        v.voucherCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900">Quản Lý Mã Giảm Giá</h1>
                    <p className="text-gray-500 mt-1">Cấu hình chi tiết các loại mã khuyến mãi.</p>
                </header>

                {/* Toolbar */}
                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="flex w-full sm:w-auto space-x-2">
                        <Input
                            placeholder="Tìm mã voucher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs flex-grow"
                        />
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        onClick={handleOpenAddDialog}
                    >
                        <Plus className="mr-2 h-5 w-5" /> TẠO MỚI
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                    <tr>
                                        <th className="p-4">Mã Code</th>
                                        <th className="p-4">Chi tiết giảm giá</th>
                                        <th className="p-4">Điều kiện đơn hàng</th>
                                        <th className="p-4 text-center">Giới hạn dùng</th>
                                        <th className="p-4 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVouchers.map((voucher, index) => (
                                        <tr key={index} className="border-b hover:bg-blue-50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800">{voucher.voucherCode}</td>
                                            
                                            <td className="p-4">
                                                {renderDiscountInfo(voucher)}
                                            </td>

                                            <td className="p-4">
                                                {voucher.minOrderAmount > 0 ? (
                                                    <div className="flex items-center text-gray-600">
                                                        <ShoppingBag className="w-4 h-4 mr-1" />
                                                        Min: {formatCurrency(voucher.minOrderAmount)}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Không yêu cầu</span>
                                                )}
                                            </td>

                                            <td className="p-4 text-center">
                                                <Badge variant="outline" className="text-sm">
                                                    {voucher.usageLimit}
                                                </Badge>
                                            </td>

                                            <td className="p-4 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(voucher)}>
                                                        <Edit className="h-4 w-4 text-gray-700" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteVoucher(voucher.voucherId, voucher.voucherCode)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- DIALOG FORM CHI TIẾT --- */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Cập nhật Voucher' : 'Tạo Voucher Mới'}</DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleSaveVoucher} className="grid grid-cols-2 gap-4 py-4">
                            {/* Dòng 1: Mã Code & Loại giảm giá */}
                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="voucherCode" className="text-gray-700 font-semibold">Mã Voucher *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="voucherCode"
                                        placeholder="VD: SUMMER2024"
                                        value={formState.voucherCode}
                                        onChange={(e) => setFormState({ ...formState, voucherCode: e.target.value.toUpperCase() })}
                                        disabled={isEditing}
                                        className="font-bold uppercase tracking-wider pl-9"
                                    />
                                    <Zap className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="discountType" className="text-gray-700 font-semibold">Loại giảm giá</Label>
                                <div className="relative mt-1">
                                    <select
                                        id="discountType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                        value={formState.discountType}
                                        onChange={(e) => setFormState({ ...formState, discountType: e.target.value })}
                                    >
                                        <option value="Percentage">Phần trăm (%)</option>
                                        <option value="Fiexd">Số tiền cố định (VNĐ)</option>
                                    </select>
                                    <Calculator className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            {/* Dòng 2: Giá trị giảm & Giới hạn dùng */}
                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="discountValue" className="text-gray-700 font-semibold">
                                    Giá trị giảm {formState.discountType === 'Percentage' ? '(%)' : '(VNĐ)'} *
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="0"
                                        value={formState.discountValue}
                                        onChange={(e) => setFormState({ ...formState, discountValue: e.target.value })}
                                        className="pl-9"
                                    />
                                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="usageLimit" className="text-gray-700 font-semibold">Tổng lượt sử dụng *</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    min="1"
                                    className="mt-1"
                                    value={formState.usageLimit}
                                    onChange={(e) => setFormState({ ...formState, usageLimit: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 border-t my-2"></div>

                            {/* Dòng 3: Điều kiện nâng cao (Max Discount & Min Order) */}
                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="maxDiscountAmount" className="text-gray-700 font-semibold">Giảm tối đa (VNĐ)</Label>
                                <p className="text-[10px] text-gray-500 mb-1">Dành cho loại phần trăm (0 = không giới hạn)</p>
                                <Input
                                    id="maxDiscountAmount"
                                    type="number"
                                    min="0"
                                    value={formState.maxDiscountAmount}
                                    onChange={(e) => setFormState({ ...formState, maxDiscountAmount: e.target.value })}
                                    disabled={formState.discountType === 'FIXED_AMOUNT'}
                                    className={formState.discountType === 'FIXED_AMOUNT' ? 'bg-gray-100' : ''}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label htmlFor="minOrderAmount" className="text-gray-700 font-semibold">Đơn hàng tối thiểu (VNĐ)</Label>
                                <p className="text-[10px] text-gray-500 mb-1">Giá trị đơn hàng tối thiểu để áp dụng</p>
                                <Input
                                    id="minOrderAmount"
                                    type="number"
                                    min="0"
                                    value={formState.minOrderAmount}
                                    onChange={(e) => setFormState({ ...formState, minOrderAmount: e.target.value })}
                                />
                            </div>

                            <DialogFooter className="col-span-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default VoucherManagementDashboard;