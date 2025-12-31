'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Mail, Phone, Info, ArrowRight, ArrowLeft, Luggage, Flag, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// --- COMPONENT FORM CON ---
function PassengerFormItem({ index, data, onChange }) {
  return (
    <div className="p-4 sm:p-6 border rounded-xl bg-white shadow-sm space-y-4 hover:border-orange-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
          <User className="h-5 w-5" />
        </div>
        {/* Sửa Label: Hiển thị chung là Hành khách + Số thứ tự */}
        <h4 className="font-bold text-gray-800 uppercase">Hành khách {index + 1}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Họ và tên */}
        <div className="sm:col-span-5">
          <Label className="text-xs font-semibold text-gray-500 uppercase">Họ và tên *</Label>
          <Input 
            className="mt-1.5 uppercase bg-gray-50 font-medium"
            placeholder="VD: NGUYEN VAN A" 
            value={data.fullName}
            onChange={(e) => onChange(index, 'fullName', e.target.value)}
          />
        </div>

        {/* Giới tính */}
        <div className="sm:col-span-3">
          <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            <Users className="h-3 w-3" /> Giới tính *
          </Label>
          <Select 
            value={data.gender} 
            onValueChange={(val) => onChange(index, 'gender', val)}
          >
            <SelectTrigger className="mt-1.5 bg-gray-50">
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Nam</SelectItem>
              <SelectItem value="Female">Nữ</SelectItem>
              <SelectItem value="Other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quốc tịch */}
        <div className="sm:col-span-4">
          <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            <Flag className="h-3 w-3" /> Quốc tịch *
          </Label>
          <Input 
            className="mt-1.5 bg-gray-50"
            placeholder="VD: Vietnam" 
            value={data.nationality}
            onChange={(e) => onChange(index, 'nationality', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ngày sinh */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Ngày sinh *
          </Label>
          <Input 
            type="date" 
            className="mt-1.5 bg-gray-50 block"
            value={data.dateOfBirth || ''}
            onChange={(e) => onChange(index, 'dateOfBirth', e.target.value)}
          />
        </div>
        
        {/* Hành lý */}
        <div>
            <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Luggage className="h-3 w-3" /> Hành lý ký gửi
            </Label>
            <Select 
                value={data.baggage} 
                onValueChange={(val) => onChange(index, 'baggage', val)}
            >
                <SelectTrigger className="mt-1.5 bg-gray-50">
                <SelectValue placeholder="Chọn hành lý" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="0">0kg (Miễn phí)</SelectItem>
                <SelectItem value="20">20kg (+150.000đ)</SelectItem>
                <SelectItem value="30">30kg (+250.000đ)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT LIÊN HỆ (Giữ nguyên) ---
function ContactInfoSection({ contact, onChange }) {
  return (
    <div className="p-4 sm:p-6 border rounded-xl bg-orange-50/50 border-orange-200 space-y-4 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">Thông tin liên hệ</h4>
          <p className="text-xs text-gray-500">Vé điện tử sẽ được gửi về đây</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Số điện thoại *</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9 bg-white" 
              placeholder="VD: 0912345678"
              value={contact.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Email *</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9 bg-white" 
              placeholder="VD: example@gmail.com"
              value={contact.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export function PassengerInputStep({ passengerCounts, onContinue, onBack }) {
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });

  // SỬA ĐỔI CHÍNH TẠI ĐÂY: Xử lý passengerCounts là số nguyên
  useEffect(() => {

    let total = 1;
    total = Number(passengerCounts) || 1;
    

    console.log("Generating forms for:", total, "passengers");

    const initialList = [];
    for(let i = 0; i < total; i++) {
        initialList.push({
            id: `pax-${i}`, 
            // Mặc định type là adult hết vì chỉ có tổng số, backend tự xử lý hoặc không cần phân biệt quá kỹ ở bước này
            type: 'adult', 
            
            // Các field data
            fullName: '',
            dateOfBirth: '',
            gender: 'Male',
            nationality: 'Vietnam',
            baggage: '0' 
        });
    }

    setPassengers(initialList);
  }, [passengerCounts]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const isPassengersValid = passengers.every(p => 
        p.fullName?.trim().length > 0 && 
        p.dateOfBirth && 
        p.gender && 
        p.nationality
    );

    const isContactValid = contactInfo.phone && contactInfo.email;

    if(!isPassengersValid) {
        alert("Vui lòng điền đầy đủ thông tin cho TẤT CẢ hành khách!");
        return;
    }
    if(!isContactValid) {
        alert("Vui lòng điền đầy đủ thông tin liên hệ!");
        return;
    }

    onContinue({ passengers, contactInfo });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <Card className="max-w-4xl mx-auto shadow-xl border-t-4 border-t-orange-600">
        <CardHeader className="border-b bg-white pb-6">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-orange-600" />
            Thông Tin Hành Khách
          </CardTitle>
          <CardDescription>
            Vui lòng điền thông tin cho <strong>{passengers.length}</strong> hành khách.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <strong>Lưu ý:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-blue-700">
                        <li>Họ tên phải viết Không Dấu (VD: NGUYEN VAN A).</li>
                        <li>Trường hợp trẻ em chưa có CCCD, nhập theo Giấy khai sinh.</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-4">
                {passengers.map((p, index) => (
                    <PassengerFormItem 
                        key={p.id} 
                        index={index} 
                        data={p} 
                        onChange={handlePassengerChange} 
                    />
                ))}
            </div>

            <ContactInfoSection contact={contactInfo} onChange={handleContactChange} />

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t mt-8">
                <Button variant="outline" onClick={onBack} className="py-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại tìm kiếm
                </Button>
                <Button 
                    onClick={handleSubmit}
                    className="py-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-lg shadow-orange-200"
                >
                    Tiếp tục chọn chỗ ngồi <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>

        </CardContent>
      </Card>
    </div>
  );
}