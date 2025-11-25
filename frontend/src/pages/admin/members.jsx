'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Loader2, UserX } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// --- Dữ liệu Mock (Giả) ---
const MOCK_ADMINS_DATA = [
    {
        "firstName": "Admin",
        "lastName": "Chính",
        "email": "admin.chinh@app.com",
        "createdAt": { "seconds": 1672531200, "nanoseconds": 0 } // Jan 1, 2023
    },
    {
        "firstName": "Nhân viên",
        "lastName": "Hỗ trợ",
        "email": "support.staff@app.com",
        "createdAt": { "seconds": 1680307200, "nanoseconds": 0 } // Mar 31, 2023
    }
];
// ----------------------------

export default function AdminManagementPage() {
  const router = useRouter()

  const [admins, setAdmins] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false) // Trạng thái cho nút submit

  // --- MOCK: Đăng ký Admin ---
  const registerAdmin = async () => {
    setIsSubmitting(true)
    // const registerAdminApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin` // API thật

    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        // MOCK: Thêm admin mới vào danh sách mock
        const newAdmin = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            createdAt: { "seconds": Math.floor(Date.now() / 1000), "nanoseconds": 0 }
        };

        // Cập nhật trạng thái admins (giả lập thành công)
        const formattedNewAdmin = {
            "name": `${newAdmin.firstName} ${newAdmin.lastName}`,
            "email": newAdmin.email,
            "createdAt": new Date(newAdmin.createdAt.seconds * 1000).toISOString().split('T')[0]
        };
        
        setAdmins(prev => [...prev, formattedNewAdmin]);
        
        toast({
          title: "Thành công",
          description: "Quản trị viên mới đã được thêm vào danh sách (MOCK)",
        })
        
        // Clear form and close dialog
        setFormData({
            firstName: '', lastName: '', email: '', password: '', repeatPassword: ''
        });
        setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "MOCK: Đã có lỗi xảy ra khi đăng ký",
        variant: "destructive"
      })
    } finally {
        setIsSubmitting(false)
    }
  }
  // ----------------------------

  // --- MOCK: Lấy danh sách Admin ---
  const getAllAdmins = async () => {
    setIsLoading(true);
    // const getAllAdminsApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/all` // API thật

    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        const res = { data: MOCK_ADMINS_DATA }; // Mock response
        
        const transformedAdmins = res.data.map(a => {
            // Xử lý cả 2 dạng date (seconds/ISO string) nếu cần, hoặc chỉ dùng seconds cho mock
            const dateValue = a.createdAt.seconds
                ? new Date(a.createdAt.seconds * 1000)
                : new Date(a.createdAt);
            
            return {
                "name": `${a.firstName} ${a.lastName}`,
                "email": a.email,
                "createdAt": dateValue.toISOString().split('T')[0]
            }
        });
        setAdmins(transformedAdmins);
    } catch (error) {
      console.error("MOCK Error:", error);
      toast({
        title: "Lỗi",
        description: "MOCK: Không thể tải danh sách Admin",
        variant: "destructive"
      })
    } finally {
        setIsLoading(false);
    }
  }
  // ----------------------------

  // Khắc phục lỗi Hydration: Fetch data trên client side
  useEffect(() => {
    // const token = localStorage.getItem('token')
    // if (!token) {
    //   router.push('/admin')
    // }
    // else 
    getAllAdmins()
  }, [router])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Thiếu tên'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Thiếu họ'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Thiếu email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Thiếu mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Độ dài mật khẩu tối thiểu 6 ký tự'
    }

    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = 'Mật khẩu không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return; // Prevent double submission

    if (validateForm()) {
      registerAdmin()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="container mx-auto pt-10 pl-64 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Admin</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md transition-all duration-200"
                onClick={() => {
                    setErrors({}); // Clear previous errors when opening
                    setFormData({
                        firstName: '', lastName: '', email: '', password: '', repeatPassword: ''
                    });
                }}
            >
              <Plus className="mr-2 h-5 w-5" />
              THÊM ADMIN MỚI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Đăng ký quản trị viên mới</DialogTitle>
            </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {/* Cải tiến UI: Gộp Họ và Tên vào 1 hàng */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Input
                            type="text"
                            name="lastName"
                            placeholder="Họ"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                    </div>
                    <div>
                        <Input
                            type="text"
                            name="firstName"
                            placeholder="Tên"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                    </div>
                </div>

              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Mật Khẩu (ít nhất 6 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  name="repeatPassword"
                  placeholder="Nhập Lại Mật Khẩu"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  className={errors.repeatPassword ? 'border-red-500' : ''}
                />
                {errors.repeatPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>
                )}
              </div>

                {/* Nút Submit có trạng thái Loading */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    'Lưu'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* THAY ĐỔI: Hiển thị trạng thái Loading */}
      {isLoading ? (
       <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <span className="text-lg font-medium">Đang tải danh sách Admin...</span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-gray-100">
                    <TableRow>
                        <TableHead className="w-[40%]">Tên</TableHead>
                        <TableHead className="w-[40%]">Email</TableHead>
                        <TableHead className="w-[20%]">Ngày đăng ký</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {admins.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                <UserX className="w-5 h-5 inline-block mr-2" />
                                Hiện chưa có quản trị viên nào trong danh sách.
                            </TableCell>
                        </TableRow>
                    ) : (
                        admins.map((admin, index) => (
                            // Dùng index tạm thời nếu dữ liệu mock không có UID
                            <TableRow key={admin.email || index}> 
                                <TableCell className="font-medium">{admin.name}</TableCell>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>{admin.createdAt}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  )
}