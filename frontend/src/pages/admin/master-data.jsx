import React, { useState, useEffect, useCallback } from 'react';
// Icons from Lucide
import { Search, Plus, Edit, Trash2, Loader2, Plane, Landmark, Building2, XCircle, CheckCircle, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog,DialogHeader,DialogTitle,DialogFooter,DialogContent  } from '@/components/ui/dialog-admin';
import {Table, TableHead,TableHeader,TableBody,TableRow,TableCell} from '@/components/ui/table-admin';
import { Tabs, TabsList,TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';





// --- MOCK DATA ---
const MOCK_AIRPORTS = [
    { id: 'SBA001', code: 'HAN', name: 'Sân bay Nội Bài', city: 'Hà Nội' },
    { id: 'SBA002', code: 'SGN', name: 'Sân bay Tân Sơn Nhất', city: 'TP. Hồ Chí Minh' },
];
const MOCK_AIRLINES = [
    { id: 'HHK001', code: 'VN', name: 'Vietnam Airlines', country: 'Việt Nam' },
    { id: 'HHK002', code: 'VJ', name: 'VietJet Air', country: 'Việt Nam' },
];
const MOCK_AIRCRAFTS = [
    { id: 'MB001', model: 'Boeing 787', capacity: 300, owner: 'VN' },
    { id: 'MB002', model: 'Airbus A321', capacity: 220, owner: 'VJ' },
];
// -----------------

// --- 1. Sub-Component: Quản lý Sân bay (Airport) ---
const AirportManagement = ({ data, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', code: '', name: '', city: '' });
    
    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.code || !formData.name || !formData.city) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const payload = { ...formData, code: formData.code.toUpperCase().trim() };

        onAction({ type: isEditing ? 'UPDATE_AIRPORT' : 'ADD_AIRPORT', payload });
        setIsDialogOpen(false);
        setFormData({ id: '', code: '', name: '', city: '' });
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ id: '', code: '', name: '', city: '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Input
                    placeholder="Tìm kiếm theo tên, mã hoặc thành phố..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAdd} variant="primary" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Sân bay Mới
                </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden shadow-sm">
                <TableHeader className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
                    <TableHead>MÃ SÂN BAY</TableHead>
                    <TableHead>TÊN SÂN BAY</TableHead>
                    <TableHead>THÀNH PHỐ</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={4} className="text-center text-gray-500">Không có dữ liệu sân bay.</TableCell></TableRow>
                    ) : (
                        filteredData.map(item => (
                            <TableRow key={item.id} className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
                                <TableCell className="font-semibold text-blue-600">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.city}</TableCell>
                                <TableCell className="text-center flex space-x-2 m-auto">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_AIRPORT', payload: item.id })}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>

            {/* Dialog Thêm/Sửa */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Sửa Thông tin Sân bay' : 'Thêm Sân bay Mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="code">Mã (Code)</Label><Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required disabled={isEditing} placeholder="VD: HAN" /></div>
                        <div><Label htmlFor="name">Tên Sân bay</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="VD: Sân bay Quốc tế Nội Bài" /></div>
                        <div><Label htmlFor="city">Thành phố</Label><Input id="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required placeholder="VD: Hà Nội" /></div>
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- 2. Sub-Component: Quản lý Hãng hàng không (Airline) ---
const AirlineManagement = ({ data, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', code: '', name: '', country: '' });

    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.code || !formData.name || !formData.country) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const payload = { ...formData, code: formData.code.toUpperCase().trim() };
        onAction({ type: isEditing ? 'UPDATE_AIRLINE' : 'ADD_AIRLINE', payload });
        setIsDialogOpen(false);
        setFormData({ id: '', code: '', name: '', country: '' });
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ id: '', code: '', name: '', country: '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Input
                    placeholder="Tìm kiếm theo tên, mã hoặc quốc gia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAdd} variant="primary" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Hãng Mới
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
                <TableHeader className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
                    <TableHead>MÃ HÃNG</TableHead>
                    <TableHead>TÊN HÃNG HÀNG KHÔNG</TableHead>
                    <TableHead>QUỐC GIA</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={4} className="text-center text-gray-500">Không có dữ liệu hãng hàng không.</TableCell></TableRow>
                    ) : (
                        filteredData.map(item => (
                            <TableRow key={item.id} className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
                                <TableCell className="font-semibold text-orange-600">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.country}</TableCell>
                                <TableCell className="text-center flex space-x-2 m-auto ">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_AIRLINE', payload: item.id })}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>

            {/* Dialog Thêm/Sửa */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Sửa Thông tin Hãng' : 'Thêm Hãng hàng không Mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="code">Mã (Code)</Label><Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required disabled={isEditing} placeholder="VD: VN" /></div>
                        <div><Label htmlFor="name">Tên Hãng</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="VD: Vietnam Airlines" /></div>
                        <div><Label htmlFor="country">Quốc gia</Label><Input id="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required placeholder="VD: Việt Nam" /></div>
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- 3. Sub-Component: Quản lý Máy bay (Aircraft) ---
const AircraftManagement = ({ data, airlinesData, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', model: '', capacity: 0, owner: '' });

    const filteredData = data.filter(item => 
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAirlineName = (ownerCode) => {
        const airline = airlinesData.find(a => a.code === ownerCode);
        return airline ? `${airline.name} (${airline.code})` : ownerCode;
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.id || !formData.model || formData.capacity <= 0 || !formData.owner) {
            alert('Vui lòng điền đầy đủ và chính xác thông tin.');
            return;
        }
        onAction({ type: isEditing ? 'UPDATE_AIRCRAFT' : 'ADD_AIRCRAFT', payload: formData });
        setIsDialogOpen(false);
        setFormData({ id: '', model: '', capacity: 0, owner: '' });
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ id: '', model: '', capacity: 0, owner: airlinesData[0]?.code || '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Input
                    placeholder="Tìm kiếm theo Mã, Model hoặc Hãng sở hữu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAdd} variant="primary" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Máy bay Mới
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
                <TableHeader className="grid-cols-[1.5fr_2fr_1fr_2fr_1.5fr]">
                    <TableHead>MÃ MÁY BAY</TableHead>
                    <TableHead>MẪU (MODEL)</TableHead>
                    <TableHead>SỨC CHỨA</TableHead>
                    <TableHead>HÃNG SỞ HỮU</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={5} className="text-center text-gray-500">Không có dữ liệu máy bay.</TableCell></TableRow>
                    ) : (
                        filteredData.map(item => (
                            <TableRow key={item.id} className="grid-cols-[1.5fr_2fr_1fr_2fr_1.5fr]">
                                <TableCell className="font-semibold text-green-600">{item.id}</TableCell>
                                <TableCell>{item.model}</TableCell>
                                <TableCell>{item.capacity} chỗ</TableCell>
                                <TableCell className="text-gray-700 font-medium">{getAirlineName(item.owner)}</TableCell>
                                <TableCell className="text-center space-x-2 flex m-auto">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_AIRCRAFT', payload: item.id })}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </div>

            {/* Dialog Thêm/Sửa */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Sửa Thông tin Máy bay' : 'Thêm Máy bay Mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div><Label htmlFor="id">Mã Máy bay</Label><Input id="id" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required disabled={isEditing} placeholder="VD: MB003" /></div>
                        <div><Label htmlFor="model">Mẫu (Model)</Label><Input id="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required placeholder="VD: Boeing 737 Max" /></div>
                        <div><Label htmlFor="capacity">Sức chứa (Chỗ)</Label><Input id="capacity" type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} required placeholder="VD: 180" /></div>
                        
                        {/* Dropdown giả lập cho Hãng sở hữu */}
                        <div>
                            <Label htmlFor="owner">Hãng sở hữu</Label>
                            <select 
                                id="owner" 
                                value={formData.owner} 
                                onChange={e => setFormData({...formData, owner: e.target.value})}
                                className="w-full p-2.5 border rounded-lg focus:outline-none transition-shadow duration-200 text-gray-800 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {airlinesData.map(airline => (
                                    <option key={airline.code} value={airline.code}>{airline.name} ({airline.code})</option>
                                ))}
                            </select>
                        </div>

                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
// ----------------------------------------------------

function MasterDataManagementDashboard() {
    const { toast } = useToast();
    const [airports, setAirports] = useState(MOCK_AIRPORTS);
    const [airlines, setAirlines] = useState(MOCK_AIRLINES);
    const [aircrafts, setAircrafts] = useState(MOCK_AIRCRAFTS);
    const [activeTab, setActiveTab] = useState("airports");
    const [isLoading, setIsLoading] = useState(false);

    // --- Xử lý hành động Mock (CRUD) ---
    const handleAction = ({ type, payload }) => {
        setIsLoading(true);
        setTimeout(() => {
            let success = true;
            let description = "";

            switch (type) {
                case 'DELETE_AIRPORT':
                    setAirports(airports.filter(a => a.id !== payload));
                    description = "Đã xóa sân bay thành công (MOCK).";
                    break;
                case 'ADD_AIRPORT':
                    setAirports([...airports, { ...payload, id: `SBA${Date.now()}` }]);
                    description = `Đã thêm sân bay ${payload.code} mới (MOCK).`;
                    break;
                case 'UPDATE_AIRPORT':
                    setAirports(airports.map(a => a.id === payload.id ? payload : a));
                    description = `Đã cập nhật sân bay ${payload.code} (MOCK).`;
                    break;
                case 'DELETE_AIRLINE':
                    setAirlines(airlines.filter(a => a.id !== payload));
                    description = "Đã xóa hãng hàng không thành công (MOCK).";
                    break;
                case 'ADD_AIRLINE':
                    setAirlines([...airlines, { ...payload, id: `HHK${Date.now()}` }]);
                    description = `Đã thêm hãng ${payload.code} mới (MOCK).`;
                    break;
                case 'UPDATE_AIRLINE':
                    setAirlines(airlines.map(a => a.id === payload.id ? payload : a));
                    description = `Đã cập nhật hãng ${payload.code} (MOCK).`;
                    break;
                case 'DELETE_AIRCRAFT':
                    setAircrafts(aircrafts.filter(a => a.id !== payload));
                    description = "Đã xóa máy bay thành công (MOCK).";
                    break;
                case 'ADD_AIRCRAFT':
                    setAircrafts([...aircrafts, { ...payload, id: payload.id.toUpperCase().trim() }]);
                    description = `Đã thêm máy bay ${payload.id} mới (MOCK).`;
                    break;
                case 'UPDATE_AIRCRAFT':
                    setAircrafts(aircrafts.map(a => a.id === payload.id ? payload : a));
                    description = `Đã cập nhật máy bay ${payload.id} (MOCK).`;
                    break;
                default:
                    success = false;
                    description = "Hành động không xác định.";
                    break;
            }

            toast({ 
                title: success ? "Thành công" : "Lỗi", 
                description: description, 
                variant: success ? "success" : "destructive" 
            });
            setIsLoading(false);
        }, 500); // Tăng độ trễ để thấy hiệu ứng loading
    };

    // --- Cải tiến TabsTrigger Mock để sử dụng state nội bộ cho active style ---
    const CustomTabsTrigger = ({ children, value, icon: Icon }) => (
        <button 
            className={`flex-grow py-2 h-auto px-4 rounded-lg text-gray-700 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 
                ${activeTab === value ? 'bg-white text-orange-600 shadow-md ring-2 ring-orange-100' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveTab(value)}
        >
            {Icon && <Icon className="h-5 w-5" />}
            <span>{children}</span>
        </button>
    );
    
    // --- Render Component ---
    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
            <div className="container mx-auto w-[1000px] pt-4">
                
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Landmark className="w-7 h-7 text-orange-600" />
                        <span>Quản Lý Dữ Liệu Cơ Sở (Master Data)</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý Sân bay, Hãng hàng không và Máy bay - các dữ liệu nền tảng cho hệ thống.</p>
                </header>

                {/* Main Content with Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
                            <CustomTabsTrigger value="airports" icon={Landmark}>Sân bay</CustomTabsTrigger>
                            <CustomTabsTrigger value="airlines" icon={Building2}>Hãng hàng không</CustomTabsTrigger>
                            <CustomTabsTrigger value="aircrafts" icon={Plane}>Máy bay</CustomTabsTrigger>
                        </TabsList>

                        <div className="mt-6 border rounded-xl p-6 bg-white shadow-xl relative">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-xl">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                </div>
                            )}
                            
                            <TabsContent value="airports" activeTab={activeTab}>
                                <AirportManagement data={airports} onAction={handleAction} />
                            </TabsContent>

                            <TabsContent value="airlines" activeTab={activeTab}>
                                <AirlineManagement data={airlines} onAction={handleAction} />
                            </TabsContent>

                            <TabsContent value="aircrafts" activeTab={activeTab}>
                                <AircraftManagement 
                                    data={aircrafts} 
                                    airlinesData={airlines} // Truyền dữ liệu airlines cho dropdown
                                    onAction={handleAction} 
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

// Export as App
export default MasterDataManagementDashboard;