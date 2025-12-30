import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogContent } from '@/components/ui/dialog-admin';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

const AirlineTab = ({ data, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ airlineId: '', airlineCode: '', airlineName: '', country: '' });

    const filteredData = data.filter(item => {
        const keyword = searchTerm.toLowerCase();
        return (item.airlineName?.toLowerCase().includes(keyword) || 
                item.airlineCode?.toLowerCase().includes(keyword) || 
                item.country?.toLowerCase().includes(keyword));
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.airlineCode || !formData.airlineName || !formData.country) return;
        const payload = { ...formData, airlineCode: formData.airlineCode.toUpperCase().trim() };
        onAction({ type: isEditing ? 'UPDATE_AIRLINE' : 'ADD_AIRLINE', payload });
        setIsDialogOpen(false);
        setFormData({ airlineId: '', airlineCode: '', airlineName: '', country: '' });
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ airlineId: '', airlineCode: '', airlineName: '', country: '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Tìm hãng hàng không..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-gray-50" />
                </div>
                <Button onClick={handleAdd} className="bg-blue-800 hover:bg-orange-700 shadow-lg shadow-orange-200">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Hãng
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>MÃ HÃNG</TableHead>
                            <TableHead>TÊN HÃNG</TableHead>
                            <TableHead>QUỐC GIA</TableHead>
                            <TableHead className="text-right pr-6">HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">Không có dữ liệu.</TableCell></TableRow>
                        ) : (
                            filteredData.map(item => (
                                <TableRow key={item.airlineId} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs border border-orange-100">
                                            {item.airlineCode}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.airlineName}</TableCell>
                                    <TableCell><div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" />{item.country}</div></TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => onAction({ type: 'DELETE_AIRLINE', payload: item.airlineId })}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-orange-700">{isEditing ? 'Sửa Hãng Hàng Không' : 'Thêm Hãng Mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label className="text-right">Mã Hãng</Label>
                            <Input className="col-span-3 uppercase" value={formData.airlineCode} onChange={e => setFormData({...formData, airlineCode: e.target.value})} disabled={isEditing} required placeholder="VN" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label className="text-right">Tên Hãng</Label>
                            <Input className="col-span-3" value={formData.airlineName} onChange={e => setFormData({...formData, airlineName: e.target.value})} required placeholder="Vietnam Airlines" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label className="text-right">Quốc Gia</Label>
                            <Input className="col-span-3" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required placeholder="Việt Nam" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">{isEditing ? 'Cập nhật' : 'Thêm mới'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AirlineTab;