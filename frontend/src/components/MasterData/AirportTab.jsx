import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogContent } from '@/components/ui/dialog-admin';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

const AirportTab = ({ data = [], onAction }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        airportId: "", airportCode: "", airportName: "", city: "", country: "",
    });

    const filteredData = data.filter((item) => {
        const keyword = searchTerm.toLowerCase();
        return (
            (item.airportCode ?? "").toLowerCase().includes(keyword) ||
            (item.airportName ?? "").toLowerCase().includes(keyword) ||
            (item.city ?? "").toLowerCase().includes(keyword)
        );
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.airportCode || !formData.airportName || !formData.city) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        const payload = {
            airportCode: formData.airportCode.toUpperCase().trim(),
            airportName: formData.airportName.trim(),
            city: formData.city.trim(),
            country: formData.country?.trim() || null,
        };
        onAction({
            type: isEditing ? "UPDATE_AIRPORT" : "ADD_AIRPORT",
            payload: isEditing ? { id: formData.airportId, data: payload } : payload,
        });
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ airportId: "", airportCode: "", airportName: "", city: "", country: "" });
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData({ ...item, country: item.country ?? "" });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm theo mã, tên sân bay..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Sân bay
                </Button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[100px]">MÃ</TableHead>
                            <TableHead>TÊN SÂN BAY</TableHead>
                            <TableHead>VỊ TRÍ</TableHead>
                            <TableHead className="text-right pr-6">HÀNH ĐỘNG</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                    Không tìm thấy dữ liệu sân bay nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.airportCode} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit text-xs">
                                            {item.airportCode}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-700">{item.airportName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {item.city}, {item.country || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => onAction({ type: "DELETE_AIRPORT", payload: item.airportId })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-blue-700">{isEditing ? "Cập nhật Sân bay" : "Thêm mới Sân bay"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid grid-cols-2 gap-6 py-4">
                        <div className="col-span-1 space-y-2">
                            <Label>Mã sân bay (IATA)</Label>
                            <Input value={formData.airportCode} onChange={(e) => setFormData({ ...formData, airportCode: e.target.value })} disabled={isEditing} placeholder="VD: HAN" className="uppercase" required />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Tên sân bay</Label>
                            <Input value={formData.airportName} onChange={(e) => setFormData({ ...formData, airportName: e.target.value })} placeholder="VD: Nội Bài International Airport" required />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <Label>Thành phố</Label>
                            <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <Label>Quốc gia</Label>
                            <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                        </div>
                        <DialogFooter className="col-span-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{isEditing ? "Lưu thay đổi" : "Tạo mới"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AirportTab;