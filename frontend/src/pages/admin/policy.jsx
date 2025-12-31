import React, { useState, useCallback } from 'react';
// Icons from Lucide (Đã sửa lỗi: Thay 'X' bằng 'XCircle' để đảm bảo tính tương thích)
import { 
    Plus, Edit, Trash2, CheckCircle, XCircle, Shield, RefreshCw, Undo2, ShoppingBag, Loader2, Armchair
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter  } from '@/components/ui/dialog-admin';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList,TabsContent } from '@/components/ui/tabs';
import {Table, TableHead,TableHeader,TableBody,TableRow,TableCell} from '@/components/ui/table-admin';


// ===========================================
// MOCK DATA & MASTER COMPONENT LOGIC
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


const POLICY_TYPES = {
    CHANGE: 'Change',
    CANCELLATION: 'Cancellation',
    REFUND: 'Refund',
    LUGGAGE: 'Luggage'
};

const MOCK_POLICIES_DATA = {
    [POLICY_TYPES.CHANGE]: [ // 51
        { id: 1, name: 'Đổi ngày bay cơ bản', type: 'Change', fee: '500,000₫ + chênh lệch giá', timeLimit: 'Trước 12h bay', status: 'Active' },
        { id: 2, name: 'Đổi tên cơ bản', type: 'Change', fee: '200,000₫', timeLimit: 'Trước 24h bay', status: 'Active' },
    ],
    [POLICY_TYPES.CANCELLATION]: [ // 52
        { id: 3, name: 'Hủy vé Economy', type: 'Cancellation', fee: '10% giá vé', timeLimit: 'Trước 24h bay', status: 'Active' },
        { id: 4, name: 'Hủy vé Business', type: 'Cancellation', fee: 'Miễn phí', timeLimit: 'Trước 48h bay', status: 'Active' },
    ],
    [POLICY_TYPES.REFUND]: [ // 53
        { id: 5, name: 'Hoàn tiền Khẩn cấp', type: 'Refund', fee: 'Áp dụng phí hủy', processingTime: '7 ngày làm việc', timeLimit: 'Ngay lập tức', status: 'Active' },
    ],
    [POLICY_TYPES.LUGGAGE]: [ // 54
        { id: 6, name: 'Hành lý Tiêu chuẩn (7kg + 20kg)', type: 'Luggage', rule: '7kg xách tay, 20kg ký gửi', fee: 'Miễn phí', status: 'Active' },
        { id: 7, name: 'Hành lý Quá khổ (Thêm 10kg)', type: 'Luggage', rule: 'Thêm 10kg ký gửi', fee: '300,000₫', status: 'Active' },
    ],
};

// ===========================================
// SUB-COMPONENT: Policy List & CRUD (51-55)
// ===========================================

const PolicyList = ({ policies, type, onAction, toast }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', fee: '', timeLimit: '', rule: '', processingTime: '' });

    const filteredPolicies = policies.filter(p => p.type === type);

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || ((type !== POLICY_TYPES.LUGGAGE) && !formData.fee) || (type === POLICY_TYPES.LUGGAGE && !formData.rule)) {
            toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc.", variant: "destructive" });
            return;
        }

        const payload = { ...formData, type: type, status: 'Active' };
        onAction({ type: isEditing ? 'UPDATE_POLICY' : 'ADD_POLICY', payload });
        setIsDialogOpen(false);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ id: '', name: '', fee: '', timeLimit: '', rule: '', processingTime: '', type: type });
        setIsDialogOpen(true);
    };

    // Định nghĩa cột bảng dựa trên loại chính sách
    const getTableStructure = () => {
        switch (type) {
            case POLICY_TYPES.REFUND:
                return {
                    cols: 'grid-cols-[2fr_2fr_2fr_2fr_1fr]',
                    heads: ['TÊN CHÍNH SÁCH', 'PHÍ ÁP DỤNG', 'THỜI GIAN XỬ LÝ', 'GIỚI HẠN THỜI GIAN', 'HÀNH ĐỘNG']
                };
            case POLICY_TYPES.LUGGAGE:
                return {
                    cols: 'grid-cols-[2fr_4fr_1.5fr_1fr]',
                    heads: ['TÊN CHÍNH SÁCH', 'QUY TẮC CHI TIẾT', 'PHÍ', 'HÀNH ĐỘNG']
                };
            default: // Change, Cancellation
                return {
                    cols: 'grid-cols-[2fr_2fr_2.5fr_1fr]',
                    heads: ['TÊN CHÍNH SÁCH', 'PHÍ ÁP DỤNG', 'GIỚI HẠN THỜI GIAN', 'HÀNH ĐỘNG']
                };
        }
    };

    const { cols, heads } = getTableStructure();
    
    // MAPPING ICON & MÀU
    const typeColor = type === POLICY_TYPES.CHANGE ? 'blue' : type === POLICY_TYPES.CANCELLATION ? 'red' : type === POLICY_TYPES.REFUND ? 'green' : 'purple';
    const typeIcon = type === POLICY_TYPES.CHANGE ? RefreshCw : type === POLICY_TYPES.CANCELLATION ? XCircle : type === POLICY_TYPES.REFUND ? Undo2 : ShoppingBag;

    return (
        <div className="space-y-6">
            <Button onClick={handleAdd} variant="primary" className={`bg-${typeColor}-600 hover:bg-${typeColor}-700 text-white w-full sm:w-auto`}>
                <Plus className="mr-2 h-5 w-5" /> THÊM CHÍNH SÁCH {type.toUpperCase()}
            </Button>
            
            <div className="border rounded-xl overflow-hidden shadow-md">
                <TableHeader className={cols}>
                    {heads.map((head, index) => <TableHead key={index}>{head}</TableHead>)}
                </TableHeader>
                <TableBody>
                    {filteredPolicies.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={heads.length} className="text-center text-gray-500">Chưa có chính sách {type} nào được cấu hình.</TableCell></TableRow>
                    ) : (
                        filteredPolicies.map(item => (
                            <TableRow key={item.id} className={cols}>
                                <TableCell className="font-semibold">{item.name}</TableCell>
                                
                                {type === POLICY_TYPES.LUGGAGE ? (
                                    <>
                                        <TableCell>{item.rule}</TableCell>
                                        <TableCell className={`font-medium text-${typeColor}-700`}>{item.fee || 'N/A'}</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell className={`font-medium text-${typeColor}-700`}>{item.fee}</TableCell>
                                        <TableCell>{item.timeLimit}</TableCell>
                                        {type === POLICY_TYPES.REFUND && <TableCell>{item.processingTime}</TableCell>}
                                    </>
                                )}
                                
                                <TableCell className="text-center space-x-2 flex">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_POLICY', payload: item.id, policyType: type })}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? `Sửa Chính sách ${type}` : `Thêm Chính sách ${type} Mới`}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="name">Tên Chính sách</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                        
                        {type === POLICY_TYPES.LUGGAGE ? (
                            <>
                                <div><Label htmlFor="rule">Quy tắc Hành lý (54)</Label><Input id="rule" value={formData.rule} onChange={e => setFormData({...formData, rule: e.target.value})} placeholder="VD: 20kg ký gửi, 7kg xách tay" required /></div>
                                <div><Label htmlFor="fee">Phí áp dụng (nếu có)</Label><Input id="fee" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} placeholder="VD: 300,000₫ hoặc Miễn phí" /></div>
                            </>
                        ) : (
                            <>
                                <div><Label htmlFor="fee">Chi phí/Phần trăm Phí ({type === POLICY_TYPES.CHANGE ? '51' : type === POLICY_TYPES.CANCELLATION ? '52' : '53'})</Label><Input id="fee" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} placeholder="VD: 10% giá vé / 500,000₫" required /></div>
                                <div><Label htmlFor="timeLimit">Giới hạn thời gian</Label><Input id="timeLimit" value={formData.timeLimit} onChange={e => setFormData({...formData, timeLimit: e.target.value})} placeholder="VD: Trước 24h bay" required /></div>
                                {type === POLICY_TYPES.REFUND && <div><Label htmlFor="processingTime">Thời gian xử lý Hoàn tiền</Label><Input id="processingTime" value={formData.processingTime} onChange={e => setFormData({...formData, processingTime: e.target.value})} placeholder="VD: 7 ngày làm việc" /></div>}
                            </>
                        )}
                        
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};


// ===========================================
// MAIN DASHBOARD COMPONENT (NEW STANDALONE PAGE)
// ===========================================

export default function PolicyManagementPage() {
    const { toast } = useToast();
    const [policies, setPolicies] = useState(MOCK_POLICIES_DATA);
    const [activeTab, setActiveTab] = useState(POLICY_TYPES.CHANGE);
    const [isLoading, setIsLoading] = useState(false); // Mock loading state

    // --- Hàm xử lý tất cả các hành động CRUD cho Chính sách (51-55) ---
    const handleAction = ({ type, payload, policyType }) => {
        setIsLoading(true);
        const currentType = policyType || activeTab;

        setTimeout(() => {
            let success = true;
            let description = "";

            setPolicies(prev => {
                let currentPolicies = [...prev[currentType]];
                
                switch (type) {
                    case 'ADD_POLICY':
                        const newId = Math.max(...currentPolicies.map(p => p.id), 0) + 1;
                        currentPolicies.push({ ...payload, id: newId, type: currentType, status: 'Active' });
                        description = `Đã thêm chính sách "${payload.name}" thành công.`;
                        break;
                    case 'UPDATE_POLICY':
                        currentPolicies = currentPolicies.map(p => p.id === payload.id ? payload : p);
                        description = `Đã cập nhật chính sách "${payload.name}" thành công.`;
                        break;
                    case 'DELETE_POLICY':
                        currentPolicies = currentPolicies.filter(p => p.id !== payload);
                        description = "Đã xóa chính sách thành công.";
                        break;
                    default:
                        success = false; description = "Hành động không xác định.";
                }
                
                return { ...prev, [currentType]: currentPolicies };
            });

            toast({ title: success ? "Thành công" : "Lỗi", description, variant: success ? "success" : "destructive" });
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto max-w-7xl pt-4">
                
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Shield className="w-7 h-7 text-indigo-600" />
                        <span>QUẢN LÝ CHÍNH SÁCH HỆ THỐNG VÉ (51-55)</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Cấu hình các quy tắc áp dụng cho việc đổi, hủy, hoàn tiền và hành lý cho khách hàng.</p>
                </header>

                {/* Main Content with Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value={POLICY_TYPES.CHANGE} activeTab={activeTab} onValueChange={setActiveTab} icon={RefreshCw} color="blue">Đổi vé (51)</TabsTrigger>
                            <TabsTrigger value={POLICY_TYPES.CANCELLATION} activeTab={activeTab} onValueChange={setActiveTab} icon={XCircle} color="red">Hủy vé (52)</TabsTrigger>
                            <TabsTrigger value={POLICY_TYPES.REFUND} activeTab={activeTab} onValueChange={setActiveTab} icon={Undo2} color="green">Hoàn tiền (53)</TabsTrigger>
                            <TabsTrigger value={POLICY_TYPES.LUGGAGE} activeTab={activeTab} onValueChange={setActiveTab} icon={ShoppingBag} color="purple">Hành lý (54)</TabsTrigger>
                        </TabsList>

                        <div className="mt-6 border rounded-xl p-6 bg-white shadow-xl relative">
                            
                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-xl">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                </div>
                            )}

                            {/* Nội dung Tab */}
                            {Object.values(POLICY_TYPES).map(policyType => (
                                <TabsContent key={policyType} value={policyType} activeTab={activeTab}>
                                    <PolicyList
                                        policies={policies[policyType]} // Truyền danh sách chính sách tương ứng
                                        type={policyType}
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
