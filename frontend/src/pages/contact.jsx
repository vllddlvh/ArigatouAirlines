'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Github, Linkedin, Facebook, Send, RotateCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator" // Cần thêm component Separator nếu chưa có
import { cn } from "@/lib/utils" // Cần utility class này cho border gradient

// Giả định utility function cn và component Separator đã có sẵn (hoặc import từ thư viện khác)

const ContactInfoCard = ({ Icon, title, content, link, isExternal }) => (
  <a
    href={link}
    target={isExternal ? "_blank" : "_self"}
    rel={isExternal ? "noopener noreferrer" : ""}
    className="group flex flex-col items-center p-4 rounded-lg bg-card transition-all duration-300 hover:bg-orange/10 hover:shadow-lg hover:-translate-y-1"
  >
    <Icon className="h-8 w-8 text-orange transition-colors duration-300 group-hover:text-primary mb-2" />
    <h4 className="text-lg font-semibold text-card-foreground">{title}</h4>
    <p className="text-sm text-muted-foreground text-center truncate w-full">{content}</p>
  </a>
)

const SocialLink = ({ Icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-3 border rounded-full text-muted-foreground transition-all duration-300 hover:text-white hover:bg-orange hover:border-orange shadow-md"
  >
    <span className="sr-only">{label}</span>
    <Icon className="h-6 w-6" />
  </a>
)

const TrangLienHe = () => {
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    chuDe: '',
    tinNhan: ''
  })
  const [dangGui, setDangGui] = useState(false)
  const [thongBaoGui, setThongBaoGui] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDangGui(true)
    setThongBaoGui('')
    // Giả lập gửi form
    await new Promise(resolve => setTimeout(resolve, 2000))
    setThongBaoGui('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi trong vòng 24 giờ. 🚀')
    setDangGui(false)
    setFormData({ ten: '', email: '', chuDe: '', tinNhan: '' })
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Khu vực Tiêu đề */}
        <header className="text-center mb-16">
          <p className="text-sm font-medium text-orange uppercase tracking-wider mb-2">
            Luôn Sẵn Lòng Lắng Nghe
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
            Kết Nối Với QAirline ✈️
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Dù bạn có thắc mắc về chuyến bay, cần hỗ trợ kỹ thuật hay muốn hợp tác, đừng ngần ngại gửi tin nhắn cho chúng tôi.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Khu vực Thông tin Chi tiết */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-2xl font-bold text-foreground border-l-4 border-orange pl-3">Thông Tin Liên Lạc</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <ContactInfoCard
                Icon={MapPin}
                title="Văn Phòng Chính"
                content="Nhà E3, 144 Xuân Thủy, Cầu Giấy, Hà Nội"
                link="https://maps.app.goo.gl/YourMapLink"
                isExternal={true}
              />
              <ContactInfoCard
                Icon={Phone}
                title="Đường Dây Nóng"
                content="+84 123 456 789 (24/7)"
                link="tel:+84123456789"
                isExternal={false}
              />
              <ContactInfoCard
                Icon={Mail}
                title="Email Hỗ Trợ"
                content="qairline-support@qairline.website"
                link="mailto:qairline-support@qairline.website"
                isExternal={false}
              />
            </div>

            <Separator className="bg-border my-4" />

            <h2 className="text-2xl font-bold text-foreground border-l-4 border-orange pl-3">Theo Dõi Chúng Tôi</h2>
            <div className="flex space-x-4">
              <SocialLink Icon={Github} href="https://github.com/oceantran27/QAirline.git" label="GitHub" />
              <SocialLink Icon={Linkedin} href="https://www.linkedin.com/in/h%C6%B0ng-nguy%E1%BB%85n-duy-685477295/" label="LinkedIn" />
              <SocialLink Icon={Facebook} href="https://www.facebook.com/profile.php?id=100045370126663" label="Facebook" />
            </div>
          </div>

          {/* Khu vực Form Liên hệ Sáng tạo */}
          <div className="lg:col-span-2">
            <Card className={cn(
                "p-8 shadow-2xl transition-all duration-500 hover:shadow-orange/30 border-2 border-transparent",
                // Áp dụng border gradient (Giả định bạn đã cấu hình className cho gradient, ví dụ: 'border-gradient-orange-to-red')
                // Nếu không có gradient, giữ nguyên border-2 border-orange cho nổi bật
                "border-orange" 
              )}
            >
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold">Gửi Tin Nhắn Của Bạn</CardTitle>
                <CardDescription>Chúng tôi sẽ liên hệ lại bạn trong thời gian sớm nhất.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Hàng 1: Tên & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ten">Tên của bạn</Label>
                      <Input
                        type="text"
                        name="ten"
                        id="ten"
                        value={formData.ten}
                        onChange={handleChange}
                        required
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email liên hệ</Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Hàng 2: Chủ đề */}
                  <div className="space-y-2">
                    <Label htmlFor="chuDe">Chủ đề</Label>
                    <Input
                      type="text"
                      name="chuDe"
                      id="chuDe"
                      value={formData.chuDe}
                      onChange={handleChange}
                      required
                      placeholder="Ví dụ: Về đặt chỗ, hỗ trợ kỹ thuật..."
                    />
                  </div>
                  
                  {/* Hàng 3: Tin nhắn */}
                  <div className="space-y-2">
                    <Label htmlFor="tinNhan">Nội dung tin nhắn</Label>
                    <Textarea
                      name="tinNhan"
                      id="tinNhan"
                      rows={6}
                      value={formData.tinNhan}
                      onChange={handleChange}
                      required
                      placeholder="Hãy mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                    />
                  </div>
                  
                  <Button 
                    variant="orange" 
                    type="submit" 
                    disabled={dangGui}
                    className="w-full sm:w-auto mt-4 px-8 py-3 text-lg transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {dangGui ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" /> Gửi Tin Nhắn
                      </>
                    )}
                  </Button>
                </form>
                
                {thongBaoGui && (
                  <Alert className="mt-6 border-l-4 border-green-500 bg-green-50">
                    <AlertDescription className="text-green-700 font-medium flex items-center">
                        ✅ {thongBaoGui}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Khu vực Bản đồ (Tùy chọn bổ sung) */}
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-6">Chúng Tôi Ở Đâu?</h2>
            <div className="w-full h-80 rounded-xl overflow-hidden shadow-xl border-2 border-orange">
                {/* Thay thế bằng iframe Google Maps thực tế của bạn */}
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0838965611257!2d105.7801833!3d21.028124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd4444444%3A0x889895c276329241!2zxJDhu5sgxJHGsOG7nW5nIFh1w6JuIFRo4bủyLCBQaOG7pWMgUOG7lSBBLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1688563200000!5m2!1svi!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>

      </div>
    </div>
  )
}

export default TrangLienHe