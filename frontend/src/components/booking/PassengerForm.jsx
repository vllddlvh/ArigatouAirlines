import { useState } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PassengerForm = ({ count, onSave, isFilled }) => {
  const [passengers, setPassengers] = useState(
    Array.from({ length: count }).map(() => ({
      firstName: "", lastName: "", birthDate: "", gender: "MALE"
    }))
  );

  const handleChange = (index, field, value) => {
    const newPas = [...passengers];
    newPas[index][field] = value;
    setPassengers(newPas);
  };

  const handleSubmit = () => {
    // Basic validation could go here
    onSave(passengers);
  };

  if (isFilled) {
    return (
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex justify-between items-center mb-6">
        <span className="text-green-700 font-medium flex items-center gap-2">
          <User className="w-5 h-5" /> Đã lưu thông tin {count} hành khách
        </span>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs bg-white">
          Nhập lại
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
        <User className="w-5 h-5 text-gray-600" />
        <h2 className="font-bold text-gray-800">Thông tin hành khách</h2>
      </div>
      <div className="p-6 space-y-6">
        {passengers.map((p, idx) => (
          <div key={idx} className="p-4 border border-gray-100 rounded-lg bg-gray-50/30">
            <h4 className="font-bold text-sm text-gray-700 mb-3">Hành khách {idx + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Họ (Last Name)</Label>
                <Input 
                  value={p.lastName} 
                  onChange={(e) => handleChange(idx, 'lastName', e.target.value)}
                  placeholder="VD: Nguyen" 
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Tên Đệm & Tên (First Name)</Label>
                <Input 
                  value={p.firstName} 
                  onChange={(e) => handleChange(idx, 'firstName', e.target.value)}
                  placeholder="VD: Van A" 
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Ngày sinh (DD/MM/YYYY)</Label>
                <Input 
                  value={p.birthDate} 
                  onChange={(e) => handleChange(idx, 'birthDate', e.target.value)}
                  placeholder="20/10/1990" 
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Giới tính</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={p.gender}
                  onChange={(e) => handleChange(idx, 'gender', e.target.value)}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" /> Lưu thông tin hành khách
        </Button>
      </div>
    </div>
  );
};