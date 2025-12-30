import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Plane } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogContent } from '@/components/ui/dialog-admin';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import StatusBadge, { AIRCRAFT_STATUS_OPTIONS } from './StatusBadge';

const AircraftTab = ({ data, airlinesData, aircraftTypesData, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAircraftId, setEditingAircraftId] = useState(null);
    const [formData, setFormData] = useState({ 
        registrationNumber: '', statusAircraft: 'Active', aircraftTypeId: '', airlineId: '' 
    });

    const filteredData = data.filter(item => {
        const keyword = searchTerm.toLowerCase();
        return (item.registrationNumber?.toLowerCase().includes(keyword) || 
                item.aircraftType?.typeName?.toLowerCase().includes(keyword) || 
                item.airline?.airlineName?.toLowerCase().includes(keyword));
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.registrationNumber || !formData.aircraftTypeId || !formData.airlineId) return;
        
        const payload = {
            ...formData,
            aircraftTypeId: parseInt(formData.aircraftTypeId),
            airlineId: parseInt(formData.airlineId),
        };
        
        onAction({ 
            type: isEditing ? 'UPDATE_AIRCRAFT' : 'ADD_AIRCRAFT', 
            payload: isEditing ? { id: editingAircraftId, data: payload } : payload 
        });
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ 
            registrationNumber: '', statusAircraft: 'Active', 
            aircraftTypeId: aircraftTypesData[0]?.aircraftTypeId || '', 
            airlineId: airlinesData[0]?.airlineId || '' 
        });
        setEditingAircraftId(null);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setEditingAircraftId(item.aircraftId);
        setFormData({
            registrationNumber: item.registrationNumber,
            statusAircraft: item.statusAircraft,
            aircraftTypeId: item.aircraftType?.aircraftTypeId,
            airlineId: item.airline?.airlineId,
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        resetForm();
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Tìm số đăng ký, loại, hãng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-gray-50" />
                </div>
                <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Máy bay
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>SỐ ĐĂNG KÝ</TableHead>
                            <TableHead>LOẠI MÁY BAY</TableHead>
                            <TableHead>SỨC CHỨA</TableHead>
                            <TableHead>HÃNG SỞ HỮU</TableHead>
                            <TableHead>TRẠNG THÁI</TableHead>
                            <TableHead className="text-right pr-6">HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="h-32 text-center text-gray-500">Không có dữ liệu máy bay.</TableCell></TableRow>
                        ) : (
                            filteredData.map(item => (
                                <TableRow key={item.aircraftId} className="hover:bg-gray-50/50">
                                    <TableCell><div className="font-bold text-emerald-700 font-mono">{item.registrationNumber}</div></TableCell>
                                    <TableCell className="font-medium">{item.aircraftType?.typeName || 'N/A'}</TableCell>
                                    <TableCell>{item.aircraftType?.totalSeats || 0} ghế</TableCell>
                                    <TableCell className="text-gray-600">{item.airline?.airlineCode || 'N/A'}</TableCell>
                                    <TableCell><StatusBadge status={item.statusAircraft} /></TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 text-gray-500 hover:text-red-600" onClick={() => onAction({ type: 'DELETE_AIRCRAFT', payload: item.aircraftId })}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogTitle className="text-emerald-700">{isEditing ? 'Cập nhật Máy bay' : 'Đăng ký Máy bay Mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Số đăng ký (Registration Number)</Label>
                            <div className="relative">
                                <Plane className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input className="pl-9" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} required placeholder="VN-A321" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Loại máy bay</Label>
                                <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.aircraftTypeId} onChange={e => setFormData({...formData, aircraftTypeId: e.target.value})} required>
                                    <option value="">Chọn loại</option>
                                    {aircraftTypesData.map(t => <option key={t.aircraftTypeId} value={t.aircraftTypeId}>{t.typeName} ({t.totalSeats} ghế)</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hãng sở hữu</Label>
                                <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.airlineId} onChange={e => setFormData({...formData, airlineId: e.target.value})} required>
                                    <option value="">Chọn hãng</option>
                                    {airlinesData.map(a => <option key={a.airlineId} value={a.airlineId}>{a.airlineCode} - {a.airlineName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.statusAircraft} onChange={e => setFormData({...formData, statusAircraft: e.target.value})}>
                                {AIRCRAFT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AircraftTab;