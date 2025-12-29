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
import * as masterDataService from '@/services/masterDataService';




// Status options cho Aircraft
const AIRCRAFT_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Ngừng hoạt động' },
    { value: 'MAINTENANCE', label: 'Đang bảo trì' },
];
// -----------------

// --- 1. Sub-Component: Quản lý Sân bay (Airport) ---
const AirportManagement = ({ data = [], onAction }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    airportId:"",
    airportCode: "",
    airportName: "",
    city: "",
    country: "",
  });

  // ===== FILTER (SAFE NULL) =====
  const keyword = searchTerm.toLowerCase();

  const filteredData = data.filter((item) =>
    (item.airportCode ?? "").toLowerCase().includes(keyword) ||
    (item.airportName ?? "").toLowerCase().includes(keyword) ||
    (item.city ?? "").toLowerCase().includes(keyword)
  );

  // ===== SAVE =====
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
    payload: isEditing
      ? { id: formData.airportId, data: payload }
      : payload,
  });

  setIsDialogOpen(false);
  resetForm();
};

  const resetForm = () => {
    setFormData({
       airportId:"", 
      airportCode: "",
      airportName: "",
      city: "",
      country: "",
    });
    setIsEditing(false);
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setIsEditing(true);
    setFormData({
      airportId: item.airportId,
      airportCode: item.airportCode,
      airportName: item.airportName,
      city: item.city,
      country: item.country ?? "",
    });
    setIsDialogOpen(true);
  };

  // ===== ADD =====
  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Tìm theo mã, tên sân bay hoặc thành phố..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleAdd} variant="primary">
          <Plus className="mr-2 h-4 w-4" /> Thêm Sân bay
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <TableHeader className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
          <TableHead>MÃ SÂN BAY</TableHead>
          <TableHead>TÊN SÂN BAY</TableHead>
          <TableHead>THÀNH PHỐ</TableHead>
          <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
        </TableHeader>

        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow className="h-24">
              <TableCell colSpan={4} className="text-center text-gray-500">
                Không có dữ liệu sân bay.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow
                key={item.airportCode}
                className="grid-cols-[1.5fr_2fr_2fr_1.5fr]"
              >
                <TableCell className="font-semibold text-blue-600">
                  {item.airportCode}
                </TableCell>
                <TableCell>{item.airportName}</TableCell>
                <TableCell>{item.city}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      onAction({
                        type: "DELETE_AIRPORT",
                        payload: item.airportId,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Sửa Sân bay" : "Thêm Sân bay"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Mã sân bay</Label>
              <Input
                value={formData.airportCode}
                onChange={(e) =>
                  setFormData({ ...formData, airportCode: e.target.value })
                }
                disabled={isEditing}
                required
              />
            </div>

            <div>
              <Label>Tên sân bay</Label>
              <Input
                value={formData.airportName}
                onChange={(e) =>
                  setFormData({ ...formData, airportName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Thành phố</Label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Quốc gia</Label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button type="submit" variant="primary">
                {isEditing ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </DialogFooter>
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
    const [formData, setFormData] = useState({ airlineId: '', airlineCode: '', airlineName: '', country: '' });

    const filteredData = data.filter(item => {
        const name = item.airlineName?.toLowerCase() || '';
        const code = item.airlineCode?.toLowerCase() || '';
        const country = item.country?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || code.includes(search) || country.includes(search);
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.airlineCode || !formData.airlineName || !formData.country) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const payload = { ...formData, airlineCode: formData.airlineCode.toUpperCase().trim() };
        onAction({ type: isEditing ? 'UPDATE_AIRLINE' : 'ADD_AIRLINE', payload });
        setIsDialogOpen(false);
        setFormData({ airlineId: '', airlineCode: '', airlineName: '', country: '' });
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData({
            airlineId: item.airlineId,
            airlineCode: item.airlineCode || '',
            airlineName: item.airlineName || '',
            country: item.country || ''
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ airlineId: '', airlineCode: '', airlineName: '', country: '' });
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
                            <TableRow key={item.airlineId} className="grid-cols-[1.5fr_2fr_2fr_1.5fr]">
                                <TableCell className="font-semibold text-orange-600">{item.airlineCode}</TableCell>
                                <TableCell>{item.airlineName}</TableCell>
                                <TableCell>{item.country}</TableCell>
                                <TableCell className="text-center flex space-x-2 m-auto ">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_AIRLINE', payload: item.airlineId })}>
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
                        <div><Label htmlFor="airlineCode">Mã (Code)</Label><Input id="airlineCode" value={formData.airlineCode} onChange={e => setFormData({...formData, airlineCode: e.target.value})} required disabled={isEditing} placeholder="VD: VN" /></div>
                        <div><Label htmlFor="airlineName">Tên Hãng</Label><Input id="airlineName" value={formData.airlineName} onChange={e => setFormData({...formData, airlineName: e.target.value})} required placeholder="VD: Vietnam Airlines" /></div>
                        <div><Label htmlFor="country">Quốc gia</Label><Input id="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required placeholder="VD: Việt Nam" /></div>
                        <DialogFooter><Button type="submit" variant="primary">{isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- 3. Sub-Component: Quản lý Máy bay (Aircraft) ---
const AircraftManagement = ({ data, airlinesData, aircraftTypesData, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAircraftId, setEditingAircraftId] = useState(null);
    const [formData, setFormData] = useState({ 
        registrationNumber: '', 
        statusAircraft: 'ACTIVE', 
        aircraftTypeId: '', 
        airlineId: '' 
    });

    const filteredData = data.filter(item => {
        const regNum = item.registrationNumber?.toLowerCase() || '';
        const typeName = item.aircraftType?.typeName?.toLowerCase() || '';
        const airlineName = item.airline?.airlineName?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return regNum.includes(search) || typeName.includes(search) || airlineName.includes(search);
    });

    const getStatusLabel = (status) => {
        const option = AIRCRAFT_STATUS_OPTIONS.find(o => o.value === status);
        return option ? option.label : status;
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'INACTIVE': return 'bg-red-100 text-red-700';
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.registrationNumber || !formData.aircraftTypeId || !formData.airlineId) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const payload = {
            ...formData,
            aircraftTypeId: parseInt(formData.aircraftTypeId),
            airlineId: parseInt(formData.airlineId),
        };
        if (isEditing) {
            onAction({ type: 'UPDATE_AIRCRAFT', payload: { id: editingAircraftId, data: payload } });
        } else {
            onAction({ type: 'ADD_AIRCRAFT', payload });
        }
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ 
            registrationNumber: '', 
            statusAircraft: 'ACTIVE', 
            aircraftTypeId: aircraftTypesData[0]?.aircraftTypeId || '', 
            airlineId: airlinesData[0]?.airlineId || '' 
        });
        setEditingAircraftId(null);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setEditingAircraftId(item.aircraftId);
        setFormData({
            registrationNumber: item.registrationNumber || '',
            statusAircraft: item.statusAircraft || 'ACTIVE',
            aircraftTypeId: item.aircraftType?.aircraftTypeId || '',
            airlineId: item.airline?.airlineId || '',
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setIsEditing(false);
        resetForm();
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Input
                    placeholder="Tìm kiếm theo số đăng ký, loại máy bay hoặc hãng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAdd} variant="primary" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Máy bay Mới
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
                <TableHeader className="grid-cols-[1.5fr_2fr_1fr_2fr_1.5fr_1.5fr]">
                    <TableHead>SỐ ĐĂNG KÝ</TableHead>
                    <TableHead>LOẠI MÁY BAY</TableHead>
                    <TableHead>SỨC CHỨA</TableHead>
                    <TableHead>HÃNG SỞ HỮU</TableHead>
                    <TableHead>TRẠNG THÁI</TableHead>
                    <TableHead className="text-center">HÀNH ĐỘNG</TableHead>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow className="h-24"><TableCell colSpan={6} className="text-center text-gray-500">Không có dữ liệu máy bay.</TableCell></TableRow>
                    ) : (
                        filteredData.map(item => (
                            <TableRow key={item.aircraftId} className="grid-cols-[1.5fr_2fr_1fr_2fr_1.5fr_1.5fr]">
                                <TableCell className="font-semibold text-green-600">{item.registrationNumber}</TableCell>
                                <TableCell>{item.aircraftType?.typeName || 'N/A'}</TableCell>
                                <TableCell>{item.aircraftType?.totalSeats || 0} chỗ</TableCell>
                                <TableCell className="text-gray-700 font-medium">
                                    {item.airline?.airlineName || 'N/A'} ({item.airline?.airlineCode || ''})
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.statusAircraft)}`}>
                                        {getStatusLabel(item.statusAircraft)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center space-x-2 flex m-auto">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onAction({ type: 'DELETE_AIRCRAFT', payload: item.aircraftId })}>
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
                        <div>
                            <Label htmlFor="registrationNumber">Số đăng ký (Registration Number)</Label>
                            <Input 
                                id="registrationNumber" 
                                value={formData.registrationNumber} 
                                onChange={e => setFormData({...formData, registrationNumber: e.target.value})} 
                                required 
                                placeholder="VD: VN-A321" 
                            />
                        </div>
                        
                        {/* Dropdown Loại máy bay */}
                        <div>
                            <Label htmlFor="aircraftTypeId">Loại máy bay</Label>
                            <select 
                                id="aircraftTypeId" 
                                value={formData.aircraftTypeId} 
                                onChange={e => setFormData({...formData, aircraftTypeId: e.target.value})}
                                className="w-full p-2.5 border rounded-lg focus:outline-none transition-shadow duration-200 text-gray-800 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">-- Chọn loại máy bay --</option>
                                {aircraftTypesData.map(type => (
                                    <option key={type.aircraftTypeId} value={type.aircraftTypeId}>
                                        {type.typeName} ({type.totalSeats} chỗ)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dropdown Hãng sở hữu */}
                        <div>
                            <Label htmlFor="airlineId">Hãng sở hữu</Label>
                            <select 
                                id="airlineId" 
                                value={formData.airlineId} 
                                onChange={e => setFormData({...formData, airlineId: e.target.value})}
                                className="w-full p-2.5 border rounded-lg focus:outline-none transition-shadow duration-200 text-gray-800 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">-- Chọn hãng hàng không --</option>
                                {airlinesData.map(airline => (
                                    <option key={airline.airlineId} value={airline.airlineId}>
                                        {airline.airlineName} ({airline.airlineCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dropdown Trạng thái */}
                        <div>
                            <Label htmlFor="statusAircraft">Trạng thái</Label>
                            <select 
                                id="statusAircraft" 
                                value={formData.statusAircraft} 
                                onChange={e => setFormData({...formData, statusAircraft: e.target.value})}
                                className="w-full p-2.5 border rounded-lg focus:outline-none transition-shadow duration-200 text-gray-800 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {AIRCRAFT_STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
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
    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [aircraftTypes, setAircraftTypes] = useState([]);
    const [activeTab, setActiveTab] = useState("airports");
    const [isLoading, setIsLoading] = useState(false);

    // --- Fetch data từ backend khi component mount ---

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
            airportRes,
            airlineRes,
            aircraftRes,
            aircraftTypeRes,
            ] = await Promise.all([
            masterDataService.getAllAirports(),
            masterDataService.getAllAirlines(),
            masterDataService.getAllAircrafts(),
            masterDataService.getAllAircraftTypes(),
            ]);

            setAirports(airportRes || []);
            setAirlines(airlineRes || []);
            setAircrafts(aircraftRes || []);
            setAircraftTypes(aircraftTypeRes || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            toast({
            title: "Lỗi",
            description: "Không thể tải dữ liệu từ server.",
            variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
        }, [toast]);

    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Xử lý hành động CRUD ---
    const handleAction = async ({ type, payload }) => {
        setIsLoading(true);
        let success = true;
        let description = "";

        try {
            switch (type) {
                /// ================= AIRPORT =================
                case "ADD_AIRPORT":
                await masterDataService.createAirport(payload);
                description = "Đã thêm sân bay.";
                break;

                case "UPDATE_AIRPORT":
                await masterDataService.updateAirport(payload.id, payload.data);
                description = "Đã cập nhật sân bay.";
                break;

                case "DELETE_AIRPORT":
                await masterDataService.deleteAirport(payload);
                description = "Đã xóa sân bay.";
                break;

                // Airline (vẫn dùng mock vì cấu trúc frontend khác backend)
                case 'DELETE_AIRLINE':
                    setAirlines(airlines.filter(a => a.airlineId !== payload));
                    description = "Đã xóa hãng hàng không thành công (MOCK).";
                    break;
                case 'ADD_AIRLINE':
                    setAirlines([...airlines, { ...payload, airlineId: Date.now() }]);
                    description = `Đã thêm hãng ${payload.airlineCode} mới (MOCK).`;
                    break;
                case 'UPDATE_AIRLINE':
                    setAirlines(airlines.map(a => a.airlineId === payload.airlineId ? payload : a));
                    description = `Đã cập nhật hãng ${payload.airlineCode} (MOCK).`;
                    break;

                // Aircraft - Gọi API Backend
                case 'DELETE_AIRCRAFT':
                    await masterDataService.deleteAircraft(payload);
                    description = "Đã xóa máy bay thành công.";
                    await fetchAllData(); // Refresh data
                    break;
                case 'ADD_AIRCRAFT':
                    await masterDataService.createAircraft(payload);
                    description = `Đã thêm máy bay ${payload.registrationNumber} mới.`;
                    await fetchAllData(); // Refresh data
                    break;
                case 'UPDATE_AIRCRAFT':
                    await masterDataService.updateAircraft(payload.id, payload.data);
                    description = `Đã cập nhật máy bay ${payload.data.registrationNumber}.`;
                    await fetchAllData(); // Refresh data
                    break;

                default:
                    success = false;
                    description = "Hành động không xác định.";
                    break;
            }
        } catch (error) {
            success = false;
            description = typeof error === 'string' ? error : "Có lỗi xảy ra. Vui lòng thử lại.";
            console.error("Lỗi xử lý hành động:", error);
        }

        if (success) {
            await fetchAllData(); 
            }

        toast({ 
            title: success ? "Thành công" : "Lỗi", 
            description: description, 
            variant: success ? "success" : "destructive" 
        });
        setIsLoading(false);
    };

   
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
                                    airlinesData={airlines}
                                    aircraftTypesData={aircraftTypes}
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