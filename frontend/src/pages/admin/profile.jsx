'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Key, LogOut, Trash2 } from 'lucide-react'
import { useRouter } from 'next/router'
import { toast } from '@/hooks/use-toast'

// --- Dữ liệu Mock (Giả) ---
const MOCK_ADMIN_DATA = {
  uid: 'adm_123456',
  firstName: 'Quản trị',
  lastName: 'Viên',
  email: 'admin.mock@example.com'
}

export default function AdminProfilePage() {
 const router = useRouter()

 const [admin, setAdmin] = useState({
  uid: '',
  firstName: '',
  lastName: '',
  email: ''
 })
 const [editForm, setEditForm] = useState({ ...admin })
 const [oldPassword, setOldPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [isLoading, setIsLoading] = useState(true)

 // Khắc phục lỗi Hydration: Fetch data trên client side
 useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) {
   // router.push('/admin') 
   setIsLoading(false)
   // Giả lập dữ liệu nếu không có token
   setAdmin(MOCK_ADMIN_DATA)
   setEditForm(MOCK_ADMIN_DATA)
  }
  else getAdmin()
 }, [router])

 // --- MOCK/REAL: Lấy thông tin Admin ---
 const getAdmin = async () => {
  setIsLoading(true)
  try {
    // MOCK API Call
    await new Promise(resolve => setTimeout(resolve, 500));
    const res = { data: MOCK_ADMIN_DATA };

    setAdmin({"uid": res.data.uid, "firstName": res.data.firstName, "lastName": res.data.lastName, "email": res.data.email})
    setEditForm({"uid": res.data.uid, "firstName": res.data.firstName, "lastName": res.data.lastName, "email": res.data.email})
  } catch (error) {
   toast({
    title: "Lỗi",
    description: "MOCK: Đã có lỗi xảy ra khi kết nối với máy chủ",
    variant: "destructive"
   })
  } finally {
    setIsLoading(false)
  }
 }

 // --- MOCK/REAL: Cập nhật thông tin Admin ---
 const handleUpdateAdmin = async (e) => {
  e.preventDefault()
  
  await new Promise(resolve => setTimeout(resolve, 500)); 

  try {
    setAdmin(editForm)
    
    toast({
     title: "Thành công",
     description: "Thông tin của bạn đã được cập nhật (MOCK)",
    })
    document.getElementById('close-dialog-update').click();
  } catch (error) {
   toast({
    title: "Cập nhật thông tin thất bại",
    description: "MOCK: Đã có lỗi xảy ra",
    variant: "destructive"
   })
  }
 }

 // --- MOCK/REAL: Xóa tài khoản ---
 const handleDeleteAccount = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    localStorage.removeItem('token')
    toast({
      title: "Thành công",
      description: "Tài khoản của bạn đã được xóa (MOCK).",
    })
    router.push('/admin')

  } catch (error) {
   toast({
    title: "Xóa tài khoản thất bại",
    description: "MOCK: Đã có lỗi xảy ra",
    variant: "destructive"
   })
  }
 }

 // --- MOCK/REAL: Đặt lại mật khẩu ---
 const handlePasswordReset = async (e) => {
  e.preventDefault()

  if (newPassword !== confirmPassword) {
   toast({
    title: "Lỗi",
    description: "Mật khẩu được gõ lại không chính xác!",
    variant: "destructive"
   })
   return
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    toast({
     title: "Thành công",
     description: "Đổi mật khẩu thành công (MOCK). Vui lòng đăng nhập lại",
    })
    router.push("/admin")
  } catch (error) {
   toast({
    title: "Đổi mật khẩu thất bại",
    description: "MOCK: Đã có lỗi xảy ra",
    variant: "destructive"
   })
  }
 }

 const handleLogout = () => {
  localStorage.removeItem('token')
  router.push("/admin")
 }
  

 return (
  <div className="container mx-auto pt-10 pl-64 space-y-8 max-w-6xl"> {/* Giảm max-width để trông cân đối hơn */}
   <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hồ Sơ Cá Nhân</h1>
   <p className="text-gray-500">Quản lý các thông tin cá nhân và cài đặt bảo mật cho tài khoản quản trị của bạn.</p>

   {isLoading ? (
       <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <span className="text-lg font-medium">Đang tải danh sách Admin...</span>
        </div>
      ) : (
        <>
        {/* --- THẺ THÔNG TIN & BẢO MẬT (Cân bằng giao diện) --- */}
   <Card className="shadow-lg">
    <CardHeader>
     <CardTitle className="flex items-center space-x-2 text-xl">
        <User className="w-5 h-5 text-blue-500" /> 
        <span>Thông tin cá nhân & Bảo mật</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Bố cục 2 cột, chia đều cho màn hình lớn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Cột 1: Thông tin cơ bản */}
        <div className="space-y-6">
          <h2 className="font-semibold text-lg text-gray-700">Thông tin cơ bản</h2>
                    {/* SỬ DỤNG GRID ĐỂ CĂN CHỈNH TỐT HƠN */}
          <div className="grid gap-4">
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-gray-500 col-span-1">Họ và tên</Label>
                            <span className="font-medium col-span-2">{admin.lastName} {admin.firstName}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-gray-500 col-span-1">Email</Label>
                            <span className="font-medium col-span-2">{admin.email}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-gray-500 col-span-1">UID</Label>
                            <span className="font-mono text-sm col-span-2">{admin.uid}</span>
                        </div>
          </div>
          <Dialog onOpenChange={(open) => {
            if (open) setEditForm(admin); 
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2">Chỉnh sửa thông tin</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md"> {/* Giảm kích thước dialog cho gọn */}
              <DialogHeader>
                <DialogTitle>Chỉnh sửa thông tin hồ sơ</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateAdmin}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="firstName">Tên</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Họ</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" id="close-dialog-update">Hủy</Button>
                  </DialogClose>
                  <Button type="submit">Lưu thay đổi</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>


        {/* Cột 2: Đặt lại mật khẩu */}
        <div className="space-y-6">
          <h2 className="font-semibold text-lg text-gray-700 flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>Đặt lại mật khẩu</span>
          </h2>
          <p className="text-sm text-gray-500">Sử dụng mật khẩu mạnh để bảo vệ tài khoản.</p>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Gõ lại mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
                        {/* Căn phải nút submit để nhấn mạnh hành động */}
            <div className="flex justify-end pt-2">
                            <Button type="submit" className="w-full sm:w-auto">Lưu mật khẩu mới</Button>
                        </div>
          </form>
        </div>
      </div>
    </CardContent>
   </Card>

   {/* --- THẺ CÀI ĐẶT & HÀNH ĐỘNG (Giữ nguyên vì đã rất gọn) --- */}
   <Card className="shadow-lg border-red-200">
    <CardHeader>
     <CardTitle className="text-xl flex items-center space-x-2 text-red-600">
      <Trash2 className="w-5 h-5" />
      <span>Khu vực nguy hiểm (Danger Zone)</span>
     </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Phân tách: Đăng xuất */}
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <p className="font-medium">Đăng xuất khỏi tài khoản</p>
          <p className="text-sm text-gray-500">Kết thúc phiên làm việc hiện tại của bạn.</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </Button>
      </div>

      {/* Phân tách: Xóa tài khoản */}
      <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="space-y-1">
          <p className="font-medium text-red-700">Xóa vĩnh viễn tài khoản quản trị</p>
          <p className="text-sm text-red-500">Thao tác này không thể hoàn tác. Dữ liệu sẽ bị mất vĩnh viễn.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Xóa tài khoản</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
              <AlertDialogDescription>
                Sẽ không thể khôi phục tài khoản một khi đã được xóa. Tất cả những dữ liệu liên quan tới tài khoản của bạn đều sẽ không được lưu lại.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Thoát</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                Xác nhận Xóa tài khoản
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
   </Card>
        </>
      )

    }
   
  </div>
 )
}