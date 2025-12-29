'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Thêm CardDescription
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, User, Key, LogOut, Trash2, Shield, UserCog } from 'lucide-react'
import { useRouter } from 'next/router'
import { toast } from '@/hooks/use-toast'

// --- Dữ liệu Mock ---
const MOCK_ADMIN_DATA = {
  uid: 'adm_123456',
  firstName: 'Quản trị',
  lastName: 'Viên',
  email: 'admin@system.com'
}

export default function AdminProfilePage() {
  const router = useRouter()

  const [admin, setAdmin] = useState({ uid: '', firstName: '', lastName: '', email: '' })
  const [editForm, setEditForm] = useState({ ...admin })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Giả lập check token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
       setIsLoading(false)
       setAdmin(MOCK_ADMIN_DATA)
       setEditForm(MOCK_ADMIN_DATA)
    } else {
       getAdmin()
    }
  }, [])

  const getAdmin = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock data response
      setAdmin(MOCK_ADMIN_DATA)
      setEditForm(MOCK_ADMIN_DATA)
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải thông tin.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    await new Promise(resolve => setTimeout(resolve, 800)); 
    setAdmin(editForm)
    toast({ title: "Thành công", description: "Đã cập nhật hồ sơ." })
    document.getElementById('close-dialog-update')?.click();
  }

  const handleDeleteAccount = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.removeItem('token')
    toast({ title: "Đã xóa", description: "Tài khoản đã bị xóa." })
    router.push('/admin')
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp.", variant: "destructive" })
      return
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Thành công", description: "Đổi mật khẩu thành công." })
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] p-6 lg:pl-72 font-sans text-slate-900">
      <div className="ml-[120px] max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <UserCog className="h-8 w-8 text-blue-600" />
                HỒ SƠ CÁ NHÂN
            </h1>
            <p className="text-slate-500 ml-11 text-sm font-medium">Quản lý thông tin tài khoản và bảo mật.</p>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
                <span className="font-medium">Đang tải dữ liệu...</span>
            </div>
        ) : (
            <div className="grid gap-8">
                {/* --- CARD CHÍNH: 2 CỘT --- */}
                <Card className="border-none shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Thông tin & Bảo mật
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                            
                            {/* CỘT 1: THÔNG TIN CƠ BẢN */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 className="font-bold text-slate-700">Thông tin tài khoản</h3>
                                    <Dialog onOpenChange={(open) => { if (open) setEditForm(admin); }}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8">Chỉnh sửa</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Cập nhật hồ sơ</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdateAdmin} className="space-y-4 py-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Họ</Label>
                                                        <Input value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Tên</Label>
                                                        <Input value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild><Button type="button" variant="outline" id="close-dialog-update">Hủy</Button></DialogClose>
                                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Họ và tên</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{admin.lastName} {admin.firstName}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Email</span>
                                        <span className="col-span-2 font-semibold text-slate-800">{admin.email}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-500 font-medium">Mã UID</span>
                                        <span className="col-span-2 font-mono text-xs bg-slate-100 w-fit px-2 py-1 rounded text-slate-600">{admin.uid}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT 2: ĐỔI MẬT KHẨU */}
                            <div className="space-y-6 lg:border-l lg:border-slate-100 lg:pl-10">
                                <div className="border-b border-slate-100 pb-2">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Key className="h-4 w-4 text-slate-400" /> Đổi mật khẩu
                                    </h3>
                                </div>
                                
                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-500 uppercase font-semibold">Mật khẩu hiện tại</Label>
                                        <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-slate-50 focus:bg-white transition-colors" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-semibold">Mật khẩu mới</Label>
                                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-50 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-semibold">Xác nhận lại</Label>
                                            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-slate-50 focus:bg-white transition-colors" />
                                        </div>
                                    </div>
                                    <div className="pt-2 flex justify-end">
                                        <Button type="submit" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 px-6">
                                            Cập nhật mật khẩu
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- CARD DANGER ZONE --- */}
                <Card className="border border-red-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-red-50/30 border-b border-red-50 pb-3">
                        <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> Khu vực nguy hiểm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                            <div>
                                <h4 className="font-semibold text-slate-800">Đăng xuất</h4>
                                <p className="text-sm text-slate-500">Kết thúc phiên làm việc hiện tại trên thiết bị này.</p>
                            </div>
                            <Button onClick={handleLogout} variant="outline" className="border-slate-300 hover:bg-slate-100 text-slate-700 min-w-[120px]">
                                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100 gap-4">
                            <div>
                                <h4 className="font-semibold text-red-700">Xóa tài khoản vĩnh viễn</h4>
                                <p className="text-sm text-red-500/80">Hành động này không thể hoàn tác và sẽ mất toàn bộ dữ liệu.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 min-w-[120px] shadow-sm shadow-red-200">
                                        Xóa tài khoản
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600">Cảnh báo xóa tài khoản</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn đang thực hiện hành động xóa vĩnh viễn tài khoản <strong>{admin.email}</strong>. 
                                            Dữ liệu sẽ không thể khôi phục. Bạn có chắc chắn không?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-lg">Hủy bỏ</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 rounded-lg">
                                            Xác nhận xóa
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  )
}