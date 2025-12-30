'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Next.js 13+ dùng next/navigation

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, UserX, ShieldCheck, Mail, Calendar, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// --- Dữ liệu Mock ---
const MOCK_ADMINS_DATA = [
    {
        "firstName": "Admin",
        "lastName": "Chính",
        "email": "admin.chinh@app.com",
        "role": "Super Admin",
        "createdAt": { "seconds": 1672531200, "nanoseconds": 0 }
    },
    {
        "firstName": "Nhân viên",
        "lastName": "Hỗ trợ",
        "email": "support.staff@app.com",
        "role": "Moderator",
        "createdAt": { "seconds": 1680307200, "nanoseconds": 0 }
    }
];

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // --- MOCK API CALLS ---
  const registerAdmin = async () => {
    setIsSubmitting(true)
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newAdmin = {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            role: "Moderator",
            createdAt: new Date().toLocaleDateString('vi-VN')
        };
        
        setAdmins(prev => [newAdmin, ...prev]);
        
        toast({
          title: "Thành công",
          description: `Đã thêm quản trị viên ${newAdmin.name}`,
          variant: "default" // Hoặc "success" nếu bạn đã config
        })
        
        setFormData({ firstName: '', lastName: '', email: '', password: '', repeatPassword: '' });
        setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể thêm quản trị viên.", variant: "destructive" })
    } finally {
        setIsSubmitting(false)
    }
  }

  const getAllAdmins = async () => {
    setIsLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const transformedAdmins = MOCK_ADMINS_DATA.map(a => ({
            name: `${a.firstName} ${a.lastName}`,
            email: a.email,
            role: a.role,
            createdAt: new Date(a.createdAt.seconds * 1000).toLocaleDateString('vi-VN')
        }));
        setAdmins(transformedAdmins);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách.", variant: "destructive" })
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllAdmins()
  }, [])

  // --- HANDLERS ---
  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Vui lòng nhập tên'
    if (!formData.lastName.trim()) newErrors.lastName = 'Vui lòng nhập họ'
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ'
    
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'
    else if (formData.password.length < 6) newErrors.password = 'Tối thiểu 6 ký tự'
    
    if (formData.password !== formData.repeatPassword) newErrors.repeatPassword = 'Mật khẩu không khớp'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return;
    if (validateForm()) registerAdmin()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F9FF] p-6 lg:pl-72 font-sans"> 
      {/* Nền xanh nhạt giống ảnh mẫu */}
      
      <div className="ml-[120px] w-[800px] mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                QUẢN LÝ ADMIN
            </h1>
            <p className="text-slate-500 ml-11">Danh sách và phân quyền quản trị viên hệ thống.</p>
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Tìm kiếm admin..." 
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500 transition-all rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Add Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-200 rounded-xl px-6">
                            <Plus className="mr-2 h-5 w-5" /> Thêm Admin Mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-800">Thêm Quản Trị Viên</DialogTitle>
                            <DialogDescription>
                                Điền thông tin để tạo tài khoản quản trị mới.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Họ</Label>
                                    <Input name="lastName" placeholder="Nguyễn" value={formData.lastName} onChange={handleChange} className={errors.lastName ? "border-red-500" : ""} />
                                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Tên</Label>
                                    <Input name="firstName" placeholder="Văn A" value={formData.firstName} onChange={handleChange} className={errors.firstName ? "border-red-500" : ""} />
                                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email đăng nhập</Label>
                                <Input type="email" name="email" placeholder="admin@example.com" value={formData.email} onChange={handleChange} className={errors.email ? "border-red-500" : ""} />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mật khẩu</Label>
                                    <Input type="password" name="password" placeholder="••••••" value={formData.password} onChange={handleChange} className={errors.password ? "border-red-500" : ""} />
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Nhập lại MK</Label>
                                    <Input type="password" name="repeatPassword" placeholder="••••••" value={formData.repeatPassword} onChange={handleChange} className={errors.repeatPassword ? "border-red-500" : ""} />
                                    {errors.repeatPassword && <p className="text-red-500 text-xs">{errors.repeatPassword}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">Hủy</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg min-w-[120px]">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tạo tài khoản"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                            <TableHead className="w-[30%] pl-6 py-4 font-bold text-slate-600">HỌ VÀ TÊN</TableHead>
                            <TableHead className="w-[30%] font-bold text-slate-600">EMAIL</TableHead>
                            <TableHead className="w-[20%] font-bold text-slate-600 text-center">VAI TRÒ</TableHead>
                            <TableHead className="w-[20%] font-bold text-slate-600 text-right pr-6">NGÀY TẠO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Skeleton Loading Rows
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="pl-6"><div className="h-5 w-32 bg-slate-100 rounded animate-pulse"></div></TableCell>
                                    <TableCell><div className="h-5 w-48 bg-slate-100 rounded animate-pulse"></div></TableCell>
                                    <TableCell className="flex justify-center"><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse"></div></TableCell>
                                    <TableCell><div className="h-5 w-24 bg-slate-100 rounded animate-pulse ml-auto mr-4"></div></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <UserX className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <p className="font-medium text-slate-600">Không tìm thấy quản trị viên nào</p>
                                        <p className="text-sm">Hãy thử từ khóa khác hoặc thêm mới.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAdmins.map((admin, index) => (
                                <TableRow key={index} className="hover:bg-blue-50/30 transition-colors group">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-800">{admin.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {admin.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={`
                                            ${admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}
                                            font-medium px-3 py-1 rounded-full
                                        `}>
                                            {admin.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 text-slate-500">
                                        <div className="flex items-center justify-end gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            {admin.createdAt}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}