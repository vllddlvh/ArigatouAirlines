"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MdEmail, MdLock } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthDialog({ children, initialTab = "login", open, onOpenChange }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState("user");
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginData.username, loginData.password, loginMode);
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: typeof error === "string" ? error : "Email hoặc mật khẩu không đúng.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu không khớp",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        email: registerData.email,
        username: registerData.username,
        fullName: registerData.fullName,
        password: registerData.password,
        // Các field bắt buộc khác dùng giá trị mặc định để đơn giản UI
        phone: "0000000000",
        dateOfBirth: "2000-01-01",
        gender: "Other",
      };

      await register(payload);
      toast({
        title: "Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo, vui lòng đăng nhập.",
        variant: "success",
      });
      // Chuyển sang tab đăng nhập sau khi đăng ký
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: typeof error === "string" ? error : "Đã xảy ra lỗi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-3xl border-white/20 shadow-xl text-white" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold text-white mb-2">
            Chào Mừng
          </DialogTitle>
          <DialogDescription className="text-cyan-200 text-lg flex items-center justify-center gap-2">
            <span className="text-[44px]"> Đến với</span>
            <Image
              src="/logo.png"
              alt="QAirlines Logo"
              width={160}
              height={50}
              className="object-contain"
            />
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
            <TabsTrigger
              value="login"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Đăng Nhập
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Đăng Ký
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="space-y-6 mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-white/80">
              <button
                type="button"
                onClick={() => setLoginMode("user")}
                className={`px-3 py-1 rounded-full border ${
                  loginMode === "user"
                    ? "bg-white/20 border-white text-white"
                    : "border-white/30 text-white/70"
                }`}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("admin")}
                className={`px-3 py-1 rounded-full border ${
                  loginMode === "admin"
                    ? "bg-orange-400/80 border-orange-300 text-white"
                    : "border-white/30 text-white/70"
                }`}
              >
                Admin
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <Label
                    htmlFor="login-username"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="login-password"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Mật Khẩu
                  </Label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white/80">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="ml-2">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Đang đăng nhập..."
                  : loginMode === "admin"
                  ? "Đăng Nhập Admin"
                  : "Đăng Nhập"}
              </Button>
            </form>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register" className="space-y-6 mt-6">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <Label
                    htmlFor="register-email"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="register-username"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Nhập tên đăng nhập (tối thiểu 6 ký tự)"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="register-fullname"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          fullName: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="register-password"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Mật Khẩu
                  </Label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Tạo mật khẩu"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="register-confirm-password"
                    className="text-white font-medium text-sm mb-2 block"
                  >
                    Xác Nhận Mật Khẩu
                  </Label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-3 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-white/60">
                Bằng việc đăng ký, bạn đồng ý với{" "}
                <a href="#" className="text-cyan-300 hover:text-cyan-200">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-cyan-300 hover:text-cyan-200">
                  Chính sách bảo mật
                </a>{" "}
                của chúng tôi.
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
