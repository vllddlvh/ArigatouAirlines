import React, { useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Cần thêm component Checkbox từ shadcn/ui
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog-admin';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { createTicketClass, updateTicketClass, deleteTicketClass } from '@/services/ticketsService'; // Sửa đúng đường dẫn service
import { useToast } from '@/hooks/use-toast';

export const FlightClassManagement = ({ classes, onRefresh }) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State khớp với TicketClassRequest
    const [formData, setFormData] = useState({
        classId: null, // Dùng để update, không gửi trong body tạo mới
        className: '',
        baggageAllowanceKg: 0,
        refundable: false,
        changeable: false
    });

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validation cơ bản
        if (!formData.className || formData.baggageAllowanceKg < 0) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tên hạng và hành lý hợp lệ.", variant: "destructive" });
            return;
        }

        const payload = {
            className: formData.className,
            baggageAllowanceKg: parseInt(formData.baggageAllowanceKg),
            refundable: formData.refundable,
            changeable: formData.changeable
        };

        try {
            if (isEditing) {
                await updateTicketClass(formData.classId, payload);
                toast({ title: "Thành công", description: "Đã cập nhật hạng vé." });
            } else {
                await createTicketClass(payload);
                toast({ title: "Thành công", description: "Đã thêm hạng vé mới." });
            }
            setIsDialogOpen(false);
            onRefresh();
        } catch (error) {
            toast({ title: "Lỗi", description: error.message || "Không thể lưu dữ liệu.", variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa hạng vé này?')) return;
        try {
            await deleteTicketClass(id);
            toast({ title: "Thành công", description: "Đã xóa hạng vé." });
            onRefresh();
        } catch (error) {
            toast({ title: "Lỗi", description: "Xóa thất bại.", variant: "destructive" });
        }
    }

    const openEdit = (item) => {
        setIsEditing(true);
        setFormData({
            classId: item.classId,
            className: item.className,
            baggageAllowanceKg: item.baggageAllowanceKg,
            refundable: item.refundable,
            changeable: item.changeable
        });
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setIsEditing(false);
        setFormData({ 
            classId: null, 
            className: '', 
            baggageAllowanceKg: 20, // Default value
            refundable: false, 
            changeable: false 
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-sm transition-all">
                <Plus className="mr-2 h-5 w-5" /> THÊM HẠNG VÉ MỚI
            </Button>
            
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/80 border-b border-gray-100 hover:bg-gray-50/80">
                            <TableHead className="w-[30%] font-bold text-gray-700">TÊN HẠNG VÉ</TableHead>
                            <TableHead className="w-[20%] font-bold text-gray-700">HÀNH LÝ (KG)</TableHead>
                            <TableHead className="w-[15%] font-bold text-center text-gray-700">HOÀN VÉ</TableHead>
                            <TableHead className="w-[15%] font-bold text-center text-gray-700">ĐỔI VÉ</TableHead>
                            <TableHead className="w-[20%] font-bold text-center text-gray-700">THAO TÁC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">Chưa có hạng vé nào.</TableCell>
                            </TableRow>
                        ) : (
                            classes.map(item => (
                                <TableRow key={item.classId} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-semibold text-blue-700">{item.className}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{item.baggageAllowanceKg} kg</TableCell>
                                    
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {item.refundable ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                    </TableCell>
                                    
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {item.changeable ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="h-8 w-8 p-0">
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.classId)} className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border-red-200">
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Cập nhật Hạng vé' : 'Tạo Hạng vé Mới'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="className">Tên Hạng vé <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="className" 
                                    placeholder="Ví dụ: Phổ thông đặc biệt"
                                    value={formData.className} 
                                    onChange={e => setFormData({...formData, className: e.target.value})} 
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="baggage">Hành lý ký gửi (Kg)</Label>
                                <div className="relative">
                                    <Input 
                                        id="baggage" 
                                        type="number" 
                                        min="0"
                                        value={formData.baggageAllowanceKg} 
                                        onChange={e => setFormData({...formData, baggageAllowanceKg: e.target.value})} 
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">kg</span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Chính sách Hoàn/Đổi</Label>
                                    <p className="text-xs text-muted-foreground">Cho phép khách hàng thay đổi vé.</p>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="refundable" 
                                            checked={formData.refundable}
                                            onCheckedChange={(checked) => setFormData({...formData, refundable: checked})}
                                        />
                                        <Label htmlFor="refundable" className="cursor-pointer font-normal">Hoàn vé</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="changeable" 
                                            checked={formData.changeable}
                                            onCheckedChange={(checked) => setFormData({...formData, changeable: checked})}
                                        />
                                        <Label htmlFor="changeable" className="cursor-pointer font-normal">Đổi vé</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                                {isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};