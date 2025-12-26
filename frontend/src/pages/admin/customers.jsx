import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
// Icons from Lucide
import { Search, Edit2, Trash2, Eye, Loader2, UserX, XCircle, CheckCircle, Lock, Unlock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog-admin";
import { EditCustomerDialog } from "@/components/admin/EditCustomerDialog";
import { API_BASE_URL, extractBody, getAuthHeader } from "@/lib/api";

// ===========================================
// MOCK UI COMPONENTS (Replacing Shadcn/UI imports)
// ===========================================

// --- 1. Toast System Mock ---
const TOAST_TIMEOUT = 3000;
function useToastMock() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ title, description, variant = 'default' }) => {
    setToast({ title, description, variant });
    const timer = setTimeout(() => setToast(null), TOAST_TIMEOUT);
    return () => clearTimeout(timer);
  }, []);

  return { toast, showToast, setToast };
}

const Toast = ({ toast }) => {
  if (!toast) return null;

  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl text-white transition-all duration-300 transform";
  let variantClasses = "bg-gray-800";
  let Icon = null;

  switch (toast.variant) {
    case 'destructive':
      variantClasses = "bg-red-600";
      Icon = XCircle;
      break;
    case 'success':
      variantClasses = "bg-green-600";
      Icon = CheckCircle;
      break;
    case 'warning':
        variantClasses = "bg-orange-500";
        Icon = Lock;
        break;
    default:
      variantClasses = "bg-blue-600";
      Icon = CheckCircle;
      break;
  }

  return (
    <div className={`${baseClasses} ${variantClasses} flex items-start space-x-3 z-50 animate-fadeInUp`}>
      {Icon && <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
      <div>
        <div className="font-semibold">{toast.title}</div>
        <p className="text-sm opacity-90">{toast.description}</p>
      </div>
    </div>
  );
};





// ===========================================
// MOCK DATA & HELPER COMPONENTS
// ===========================================

// --- Dữ liệu Mock (Giả) ĐÃ CẬP NHẬT isSuspended ---
const MOCK_CUSTOMERS = [
    {
        "uid": "cus_001",
        "firstName": "An",
        "lastName": "Nguyễn Văn",
        "email": "an.nguyen@example.com",
        "dateOfBirth": { "seconds": 946684800, "nanoseconds": 0 }, 
        "gender": "male",
        "loyaltyPoints": 150,
        "createdAt": { "seconds": 1672531200, "nanoseconds": 0 },
        "address": "123 Đường ABC, Hà Nội",
        "passportNumber": "P1234567",
        "identificationNumber": "001123456789",
        "isSuspended": false // Mới
    },
    {
        "uid": "cus_002",
        "firstName": "Bình",
        "lastName": "Trần Thị",
        "email": "binh.tran@example.com",
        "dateOfBirth": "1995-05-15T00:00:00.000Z", 
        "gender": "female",
        "loyaltyPoints": 400,
        "createdAt": "2022-08-10T00:00:00.000Z", 
        "address": "456 Phố XYZ, TP.HCM",
        "passportNumber": "P9876543",
        "identificationNumber": "079987654321",
        "isSuspended": true // Mới: Bị khóa
    },
    {
        "uid": "cus_003",
        "firstName": "Cường",
        "lastName": "Lê",
        "email": "cuong.le@example.com",
        "dateOfBirth": { "seconds": 852076800, "nanoseconds": 0 }, 
        "gender": "male",
        "loyaltyPoints": 50,
        "createdAt": { "seconds": 1680307200, "nanoseconds": 0 }, 
        "address": "789 Đại lộ M, Đà Nẵng",
        "isSuspended": false // Mới
    }
];
// ------------------------------------------

// Helper component for Detail Dialog
const DetailItem = ({ label, value }) => (
    <div className="grid grid-cols-4 items-start gap-2 border-b border-gray-100 pb-2">
        <span className="font-semibold text-gray-700 col-span-1">{label}:</span>
        <span className="col-span-3 text-gray-800 break-words">{value || 'N/A'}</span>
    </div>
);

// ===========================================
// MAIN COMPONENT
// ===========================================

function CustomerManagementDashboard() {
  const { toast, showToast } = useToastMock();

  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true) 
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- Hàm API getAllCustomers ---
  const getAllCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: getAuthHeader(),
      });

      const users = extractBody(response) || [];

      const transformedCustomers = users.map((u) => {
        const fullName = String(u.fullName || "").trim();
        const parts = fullName ? fullName.split(/\s+/) : [];
        const firstName = parts.length ? parts[parts.length - 1] : "";
        const lastName = parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName;
        const gender = String(u.gender || "Other").toLowerCase();

        return {
          uid: String(u.userId ?? u.id ?? u.uid ?? ""),
          userId: u.userId ?? u.id,
          firstName,
          lastName,
          email: u.email || "",
          dateOfBirth: u.dateOfBirth || "",
          gender,
          isSuspended: false,
          roles: u.roles,
          username: u.username,
          fullName: u.fullName,
          phone: u.phone || "",
          phoneNumber: u.phone || "",
        };
      });

      setCustomers(transformedCustomers);
    } catch (error) {
      showToast({
        title: "Lỗi tải dữ liệu",
        description: error.response?.data?.message || "Không thể tải danh sách khách hàng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  // ------------------------------------------
  
  // --- Khóa/Mở Khóa Tài khoản ---
  const toggleCustomerSuspension = async () => {
      showToast({
          title: "Chưa hỗ trợ",
          description: "Chức năng khóa/mở khóa chưa được backend hỗ trợ trong dự án hiện tại.",
          variant: "warning"
      });
  };
  // ------------------------------------------


  // Fetch data on mount
  useEffect(() => {
    getAllCustomers()
  }, [getAllCustomers]) 

  const filteredCustomers = customers.filter(
    (customer) =>
    (`$${customer.lastName} ${customer.firstName}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.uid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
  }

  const handleEditComplete = (updatedCustomer) => {
    setCustomers(customers.map(c => c.uid === String(updatedCustomer.userId ?? updatedCustomer.uid) ? updatedCustomer : c))
    setEditingCustomer(null)
    showToast({
      title: "Thành công",
      description: "Thông tin khách hàng đã được cập nhật",
      variant: "success"
    })
  }

  const handleDelete = async (customer) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khách hàng ${customer.lastName} ${customer.firstName}?`)) {
        return;
    }

    const userId = customer.userId ?? customer.uid;
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: getAuthHeader(),
      });
      setCustomers(customers.filter(a => a.uid !== customer.uid))
      showToast({
        title: "Thành công",
        description: `Khách hàng ${customer.uid} đã được xóa`,
        variant: "destructive"
      })
    } catch (error) {
      showToast({
        title: "Xóa thất bại",
        description: error.response?.data?.message || "Không thể xóa khách hàng",
        variant: "destructive"
      })
    }
  }
  
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };
  
  // Custom Table Row component
  const CustomerTableRow = ({ customer }) => {
      const isSuspended = customer.isSuspended;
      
      // Thêm class mờ và cảnh báo cho tài khoản bị khóa
      const rowClasses = isSuspended 
          ? "bg-red-50 hover:bg-red-100 opacity-70"
          : "hover:bg-gray-50";

      return (
          <div 
              key={customer.uid}
              className={`grid grid-cols-[1.5fr_2fr_1.2fr_1fr_1fr_1fr] items-center p-4 border-b transition-colors ${rowClasses}`}
          >
              <div className="font-medium text-gray-900 truncate flex items-center">
                  {isSuspended && <Lock className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />}
                  <span className={isSuspended ? "text-red-500" : ""}>{`${customer.lastName} ${customer.firstName}`}</span>
              </div>
              <div className="text-gray-600 truncate">{customer.email}</div>
              <div className="text-gray-600 text-sm">{customer.phone || "-"}</div>
              <div className="text-gray-600 text-sm hidden md:block">{customer.dateOfBirth || "-"}</div>
              <div className="text-gray-600 text-sm hidden sm:block">{customer.gender === "male" ? "Nam" : "Nữ"}</div>
              
              {/* Actions Cell */}
              <div className="flex space-x-1 justify-end">
                  {/* Nút Khóa/Mở Khóa */}
                  <Button 
                      variant={isSuspended ? "outline" : "warning"} 
                      className="p-2 h-auto" 
                      title={isSuspended ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      onClick={() => toggleCustomerSuspension(customer)}
                  >
                      {isSuspended ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-red-600" />}
                  </Button>
                  
                  <Button variant="outline" className="p-2 h-auto" onClick={() => handleViewDetails(customer)}>
                      <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="outline" className="p-2 h-auto" onClick={() => handleEdit(customer)} disabled={isSuspended}>
                      <Edit2 className={`w-4 h-4 ${isSuspended ? "text-gray-400" : "text-yellow-600"}`} />
                  </Button>
                  <Button variant="destructive" className="p-2 h-auto" onClick={() => handleDelete(customer)}>
                      <Trash2 className="w-4 h-4" />
                  </Button>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 lg:pl-64 mx-auto">
      <div className="container mx-auto max-w-6xl pt-4">
        
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Quản Lý Khách Hàng
          </h1>
          <p className="text-gray-500 mt-1">Danh sách chi tiết và thao tác quản lý tài khoản khách hàng.</p>
        </header>

        {/* Search Bar */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Input
            placeholder="Tìm kiếm theo Tên, Email hoặc UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow max-w-full sm:max-w-md"
          />
          <Button variant="primary">
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
        
        {/* Customer List Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                <span className="text-lg font-medium">Đang tải danh sách khách hàng...</span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_2fr_1.2fr_1fr_1fr_1fr] p-4 font-bold text-xs uppercase tracking-wider text-gray-700 bg-gray-100 border-b border-gray-200">
                  <div className="truncate">HỌ VÀ TÊN</div>
                  <div className="truncate">EMAIL</div>
                  <div className="truncate">SĐT</div>
                  <div className="truncate hidden md:block">NGÀY SINH</div>
                  <div className="truncate hidden sm:block">GT</div>
                  <div className="text-right">THAO TÁC</div>
                </div>
              </div>
              
              <div className="min-w-[700px]">
                {filteredCustomers.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-500 p-4">
                      <UserX className="w-6 h-6 mb-2" />
                      <span className="text-base">Không tìm thấy khách hàng nào.</span>
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <CustomerTableRow key={customer.uid} customer={customer} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
      
      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
             <DialogHeader>
               <DialogTitle>Thông tin chi tiết khách hàng</DialogTitle>
             </DialogHeader>
             {selectedCustomer && (
               <div className="grid gap-4 py-4 text-sm">
                 <DetailItem label="Trạng thái" value={selectedCustomer.isSuspended ? "ĐÃ KHÓA" : "Hoạt động"} /> {/* Mới */}
                 <DetailItem label="UID" value={selectedCustomer.uid} />
                 <DetailItem label="Họ và tên" value={`${selectedCustomer.lastName} ${selectedCustomer.firstName}`} />
                 <DetailItem label="Email" value={selectedCustomer.email} />
                 <DetailItem label="Số điện thoại" value={selectedCustomer.phone || "-"} />
                 <DetailItem label="Ngày sinh" value={selectedCustomer.dateOfBirth || "-"} />
                 <DetailItem label="Giới tính" value={selectedCustomer.gender === "male" ? "Nam" : "Nữ"} />
                 <DetailItem label="Username" value={selectedCustomer.username || "-"} />
               </div>
             )}
          </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      {editingCustomer && (
        <EditCustomerDialog
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleEditComplete}
        />
      )}

      <Toast toast={toast} />
    </div>
  )
}

// Export as App
export default CustomerManagementDashboard;