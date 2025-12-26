import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import { API_BASE_URL } from '@/lib/api'

export function EditCustomerDialog({ customer, onClose, onSave }) {
  const [editedCustomer, setEditedCustomer] = useState(customer)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedCustomer(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setEditedCustomer(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const userId = editedCustomer.userId ?? editedCustomer.uid ?? editedCustomer.id
    const updateCustomerApi = `${API_BASE_URL}/users/${userId}`

    try {
        const payload = {
          fullName: `${editedCustomer.lastName || ''} ${editedCustomer.firstName || ''}`.trim(),
          email: editedCustomer.email,
          phone: editedCustomer.phoneNumber || editedCustomer.phone,
          gender: editedCustomer.gender
            ? String(editedCustomer.gender).replace(/^./, (c) => c.toUpperCase())
            : undefined,
        }

        const response = await fetch(updateCustomerApi, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        })

        const responseText = await response.text().catch(() => '')

        if (!response.ok) {
            let message = responseText || "Send request failed"
            try {
              const parsed = JSON.parse(responseText)
              message = parsed?.message || parsed?.error || message
            } catch {}
            throw new Error(message)
        }

        let updatedFromApi = null
        try {
          const parsed = JSON.parse(responseText)
          updatedFromApi = parsed?.body ?? parsed
        } catch {}

        const fullName = String(updatedFromApi?.fullName ?? payload.fullName ?? '').trim()
        const parts = fullName ? fullName.split(/\s+/) : []
        const firstName = parts.length ? parts[parts.length - 1] : editedCustomer.firstName
        const lastName = parts.length > 1 ? parts.slice(0, -1).join(' ') : (fullName || editedCustomer.lastName)

        const mergedCustomer = {
          ...editedCustomer,
          ...(updatedFromApi || {}),
          firstName,
          lastName,
          phoneNumber: updatedFromApi?.phone ?? payload.phone ?? editedCustomer.phoneNumber,
        }

        toast({
          title: "Thành công",
          description: "Thông tin của khách hàng đã được cập nhật",
        })

        onSave(mergedCustomer)
    } catch (error) {
      toast({
        title: "Cập nhật thông tin thất bại",
        description: error?.message || "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng tải lại trang hoặc đăng nhập lại",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Tên
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={editedCustomer.firstName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Họ
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={editedCustomer.lastName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={editedCustomer.phoneNumber || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Giới tính
              </Label>
              <Select name="gender" value={editedCustomer.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}