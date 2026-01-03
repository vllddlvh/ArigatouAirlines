import React, { useState, useCallback, useEffect } from 'react';
// Icons from Lucide
import { 
    Plus, Edit, Trash2, CheckCircle, XCircle, DollarSign, ShoppingBag, Armchair, Shield, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter  } from '@/components/ui/dialog-admin';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList,TabsContent } from '@/components/ui/tabs';
import {Table, TableHead,TableHeader,TableBody,TableRow,TableCell} from '@/components/ui/table-admin';
import { createAncillaryService, deleteAncillaryService, getAllAncillaryServices, updateAncillaryService } from '@/services/ancillaryService';


// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount) => {
    // Chỉ định rõ locale 'vi-VN' và style currency
    if (typeof amount !== 'number') return amount;
    return amount.toLocaleString('vi-VN') + '₫';
};


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


// ===========================================
// MOCK DATA & CONFIGURATION
// ===========================================

const FEE_TYPES = {
    LUGGAGE: 'LuggageFee',        // Hành lý ký gửi
    SEAT: 'SeatSelectionFee',     // Phí chọn ghế
    INSURANCE: 'InsuranceFee'     // Phí bảo hiểm
};

const MOCK_FEES_DATA = {
    [FEE_TYPES.LUGGAGE]: [
        { id: 101, name: 'Hành lý 5kg', price: 150000, condition: 'Áp dụng cho mọi tuyến', type: 'Fixed' },
        { id: 102, name: 'Hành lý 15kg', price: 300000, condition: 'Áp dụng cho mọi tuyến', type: 'Fixed' },
        { id: 103, name: 'Hành lý 25kg (Quốc tế)', price: 650000, condition: 'Tuyến Quốc tế', type: 'Fixed' },
    ],
    [FEE_TYPES.SEAT]: [
        { id: 201, name: 'Ghế ngồi sát lối đi', price: 50000, type: 'Fixed', condition: 'Phụ thuộc loại máy bay' },
        { id: 202, name: 'Ghế Thoải mái (Extra Legroom)', price: 150000, type: 'Fixed', condition: 'Hàng thoát hiểm' },
        { id: 203, name: 'Ghế tiêu chuẩn', price: 0, type: 'Fixed', condition: 'Tự động chọn/Miễn phí' },
    ],
    [FEE_TYPES.INSURANCE]: [
        { id: 301, name: 'Bảo hiểm cơ bản', price: 50000, type: 'Fixed', rule: 'Bảo hiểm chuyến đi' },
        { id: 302, name: 'Bảo hiểm toàn diện', price: 0.03, type: 'Percent', rule: '3% tổng giá vé' },
    ],
};

// ===========================================
// SUB-COMPONENT: Fee Configuration List
// ===========================================

const FeeList = ({ fees, type, onAction, toast }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', price: 0, condition: '', type: 'Fixed', rule: '' });

    const typeConfig = {
        [FEE_TYPES.LUGGAGE]: { name: 'Hành lý ký gửi', icon: ShoppingBag, color: 'purple', priceLabel: 'Phí (VND)', conditionLabel: 'Điều kiện/Trọng lượng' },
        [FEE_TYPES.SEAT]: { name: 'Phí chọn ghế', icon: Armchair, color: 'indigo', priceLabel: 'Phí (VND)', conditionLabel: 'Vị trí/Loại ghế' },
        [FEE_TYPES.INSURANCE]: { name: 'Phí bảo hiểm', icon: Shield, color: 'green', priceLabel: 'Giá trị', conditionLabel: 'Quy tắc' },
    };
    const config = typeConfig[type];

    const handleSave = (e) => {
        e.preventDefault();
        
        let priceValue;
        if (type === FEE_TYPES.INSURANCE && formData.type === 'Percent') {
            priceValue = parseFloat(formData.price);
        } else {
            priceValue = parseInt(formData.price) || 0;
        }

        if (!formData.name || (type !== FEE_TYPES.INSURANCE && priceValue < 0)) {
            toast({ title: "Lỗi", description: "Vui lòng điền đủ tên và giá trị phí hợp lệ.", variant: "destructive" });
            return;
        }

        // Lấy điều kiện/quy tắc dựa trên loại phí
        const conditionOrRule = formData.condition || formData.rule;

        const payload = { 
            ...formData, 
            price: priceValue, 
            type: formData.type || 'Fixed',
            condition: type !== FEE_TYPES.INSURANCE ? conditionOrRule : '',
            rule: type === FEE_TYPES.INSURANCE ? conditionOrRule : ''
        };
        
        onAction({ type: isEditing ? 'UPDATE_FEE' : 'ADD_FEE', payload, feeType: type });
        setIsDialogOpen(false);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        // Đảm bảo rule/condition được đồng bộ khi mở edit
        const initialCondition = type === FEE_TYPES.INSURANCE ? item.rule : item.condition;
        
        setFormData({ 
            ...item, 
            type: item.type || 'Fixed',
            condition: initialCondition, // Dùng condition cho form, sẽ map lại ở handleSave
            rule: initialCondition
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ 
            id: '', 
            name: '', 
            price: (type === FEE_TYPES.INSURANCE && formData.type === 'Percent') ? 0.01 : 0, 
            condition: '', 
            type: (type === FEE_TYPES.INSURANCE ? 'Fixed' : 'Fixed'), 
            rule: '' 
        });
        setIsDialogOpen(true);
    };
    
    // Format giá trị cho bảng
    const formatFeeDisplay = (item) => {
        if (item.type === 'Percent') {
            return `${(item.price * 100).toFixed(0)}%`;
        }
        return formatCurrency(item.price);
    };


    return (
        <div className="space-y-6">
            <Button onClick={handleAdd} variant="primary" className={`bg-${config.color}-600 hover:bg-${config.color}-700 text-white w-full sm:w-auto`}>
                <Plus className="mr-2 h-5 w-5" /> CẤU HÌNH {config.name.toUpperCase()} MỚI
            </Button>
            
            <div className="border rounded-xl overflow-hidden shadow-md">
                <TableHeader className="min-w-[800px] grid-cols-[2fr_1.5fr_4fr_1fr]">
                    <TableHead>TÊN PHÍ/DỊCH VỤ</TableHead>
                    <TableHead>{config.priceLabel.toUpperCase()}</TableHead>
                    <TableHead>{config.conditionLabel.toUpperCase()}</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {fees.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={4} className="text-center text-gray-500">Chưa có cấu hình phí nào.</TableCell></TableRow>
                    ) : (
                        fees.map(item => (
                            <TableRow key={item.id} className="min-w-[800px] grid-cols-[2fr_1.5fr_4fr_1fr]">
                                <TableCell className="font-semibold text-gray-800">{item.name}</TableCell>
                                <TableCell className={`font-medium text-green-700`}>
                                    {formatFeeDisplay(item)}
                                </TableCell>
                                <TableCell className="text-gray-600 text-sm">{item.condition || item.rule || 'Toàn bộ'}</TableCell>
                                <TableCell className="text-center space-x-2 flex">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_FEE', payload: item.id, feeType: type })}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? `Sửa Cấu hình ${config.name}` : `Thêm Cấu hình ${config.name} Mới`}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="name">Tên Dịch vụ</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                        
                        {/* Phí bảo hiểm có thể là % */}
                        {type === FEE_TYPES.INSURANCE && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="feeType">Loại Giá trị</Label>
                                    <select 
                                        id="feeType" 
                                        value={formData.type} 
                                        onChange={e => setFormData({...formData, type: e.target.value, price: (e.target.value === 'Percent' ? 0.01 : 10000) })}
                                        className="w-full p-3 border rounded-lg h-11 border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Fixed">VND (Giá cố định)</option>
                                        <option value="Percent">% (Phần trăm giá vé)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="price">Giá trị</Label>
                                    <Input 
                                        id="price" 
                                        type="number"
                                        min={formData.type === 'Percent' ? 0.01 : 0}
                                        step={formData.type === 'Percent' ? 0.01 : 1000}
                                        value={formData.price} 
                                        onChange={e => setFormData({...formData, price: e.target.value})} 
                                        placeholder={formData.type === 'Percent' ? "VD: 0.03 (3%)" : "VD: 50000"} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Hành lý và Chọn ghế là giá cố định VND */}
                        {type !== FEE_TYPES.INSURANCE && (
                            <div>
                                <Label htmlFor="price">Phí (VND)</Label>
                                <Input id="price" type="number" min="0" step="1000" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} placeholder="VD: 300000" required />
                            </div>
                        )}

                        {/* Điều kiện/Quy tắc */}
                        <div>
                            <Label htmlFor="condition">{config.conditionLabel}</Label>
                            <Input 
                                id="condition" 
                                value={formData.condition || formData.rule || ''} 
                                onChange={e => setFormData({...formData, condition: e.target.value, rule: e.target.value})} 
                                placeholder="VD: 25kg ký gửi / Hàng ghế đầu" 
                                required 
                            />
                        </div>
                        
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ===========================================
// MAIN DASHBOARD COMPONENT
// ===========================================

export default function ServiceFeeManagementPage() {
    const { toast } = useToast();
    const [fees, setFees] = useState({
        [FEE_TYPES.LUGGAGE]: [],
        [FEE_TYPES.SEAT]: [],
        [FEE_TYPES.INSURANCE]: [],
    });
    const [activeTab, setActiveTab] = useState(FEE_TYPES.LUGGAGE);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllAncillaryServices();
            const list = Array.isArray(data) ? data : [];

            const mappedForAll = list.map((s) => {
                const rawPrice = s?.price;
                const priceNumber = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
                const safePrice = Number.isFinite(priceNumber) ? priceNumber : 0;

                const description = s?.description ?? '';

                return {
                    id: s?.serviceId,
                    name: s?.serviceName,
                    price: safePrice,
                    condition: description,
                    rule: description,
                    type: safePrice > 0 && safePrice <= 1 ? 'Percent' : 'Fixed',
                };
            });

            setFees({
                [FEE_TYPES.LUGGAGE]: mappedForAll,
                [FEE_TYPES.SEAT]: mappedForAll,
                [FEE_TYPES.INSURANCE]: mappedForAll,
            });
        } catch (error) {
            const msg = error?.response?.data?.message || 'Không thể tải danh sách dịch vụ. Hãy đảm bảo bạn đã đăng nhập admin.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllServices();
    }, [fetchAllServices]);

    // --- Hàm xử lý tất cả các hành động CRUD cho Phí dịch vụ ---
    const handleAction = async ({ type, payload, feeType }) => {
        setIsLoading(true);

        try {
            if (type === 'ADD_FEE') {
                await createAncillaryService({
                    serviceName: payload?.name,
                    description: payload?.condition || payload?.rule || '',
                    price: payload?.price ?? 0,
                });
                toast({ title: 'Thành công', description: `Đã thêm dịch vụ "${payload?.name}".`, variant: 'success' });
                await fetchAllServices();
                return;
            }

            if (type === 'UPDATE_FEE') {
                await updateAncillaryService(payload?.id, {
                    serviceName: payload?.name,
                    description: payload?.condition || payload?.rule || '',
                    price: payload?.price ?? 0,
                });
                toast({ title: 'Thành công', description: `Đã cập nhật dịch vụ "${payload?.name}".`, variant: 'success' });
                await fetchAllServices();
                return;
            }

            if (type === 'DELETE_FEE') {
                const ok = window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?');
                if (!ok) return;
                await deleteAncillaryService(payload);
                toast({ title: 'Thành công', description: 'Đã xóa dịch vụ.', variant: 'success' });
                await fetchAllServices();
                return;
            }

            toast({ title: 'Lỗi', description: 'Hành động không xác định.', variant: 'destructive' });
        } catch (error) {
            const msg = error?.response?.data?.message || 'Thao tác thất bại. Hãy kiểm tra quyền ADMIN và dữ liệu nhập.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <DollarSign className="w-7 h-7 text-green-600" />
                        <span>QUẢN LÝ DỊCH VỤ VÀ PHÍ BỔ SUNG</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Cấu hình các mức phí cho hành lý, chọn ghế và bảo hiểm chuyến đi (Gồm xem danh sách phí).</p>
                </header>

                {/* Main Content with Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value={FEE_TYPES.LUGGAGE} activeTab={activeTab} onValueChange={setActiveTab} icon={ShoppingBag} color="purple">Hành lý ký gửi</TabsTrigger>
                            <TabsTrigger value={FEE_TYPES.SEAT} activeTab={activeTab} onValueChange={setActiveTab} icon={Armchair} color="indigo">Phí chọn ghế</TabsTrigger>
                            <TabsTrigger value={FEE_TYPES.INSURANCE} activeTab={activeTab} onValueChange={setActiveTab} icon={Shield} color="green">Phí bảo hiểm</TabsTrigger>
                        </TabsList>

                        <div className="mt-6 border rounded-xl p-6 bg-white shadow-xl relative">
                            
                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-xl">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                                </div>
                            )}

                            {/* Nội dung Tab */}
                            {Object.values(FEE_TYPES).map(feeType => (
                                <TabsContent key={feeType} value={feeType}>
                                    <FeeList
                                        fees={fees[feeType]} 
                                        type={feeType}
                                        onAction={handleAction}
                                        toast={toast}
                                    />
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
