"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiMenuAlt3 } from "react-icons/hi";
import { MdClose, MdSearch, MdPerson, MdSettings, MdLogout } from "react-icons/md";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import AuthDialog from "./AuthDialog";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout: authLogout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const logout = () => {
    authLogout();
    setIsOpen(false);
  };

  const links = [
    { href: "/", label: "Trang chủ" },
    { href: "/flights", label: "Chuyến bay" },
    { href: "/news", label: "Tin tức" },
    { href: "/contact", label: "Liên hệ" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-cyan-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="QAirlines Logo" width={160} height={40} />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white text-lg font-medium transition-all duration-300 ${
                pathname === link.href
                  ? "text-cyan-300 border-b-2 border-cyan-300 pb-1"
                  : "hover:text-cyan-300 hover:scale-105"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search + User - Redesign */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Search Button with Expandable Input */}
          <div className="relative">
            <button
              onClick={toggleSearch}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <MdSearch className="text-xl" />
              <span className="font-medium">Tìm kiếm...</span>
            </button>
            
            {searchOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 min-w-80 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <MdSearch className="text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chuyến bay, điểm đến..."
                    className="flex-1 border-none outline-none text-gray-800 placeholder-gray-400"
                    autoFocus
                  />
                  <button 
                    onClick={toggleSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            // Avatar with Modern Popover
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <MdPerson className="text-white text-lg" />
                  </div>
                  <span className="font-medium">Tài khoản</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-4 animate-in zoom-in-95">
                <div className="flex flex-col gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <MdPerson className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.username || 'Người dùng'}</p>
                      <p className="text-sm text-gray-500">Thành viên</p>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <Link 
                    href="/my-account" 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <MdPerson className="text-blue-500 text-xl group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">Tài khoản</span>
                  </Link>
                  
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <MdSettings className="text-blue-500 text-xl group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">Cài đặt</span>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors group text-red-500"
                  >
                    <MdLogout className="text-xl group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            // Login/Signup Buttons - Modern Design
            <div className="flex items-center gap-3">
              <AuthDialog initialTab="login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  <MdPerson className="mr-2 text-lg" />
                  Đăng nhập
                </Button>
              </AuthDialog>
              
              <AuthDialog initialTab="register">
                <Button variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white/10 font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105">
                  Đăng ký
                </Button>
              </AuthDialog>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden text-white text-3xl cursor-pointer" onClick={toggleMenu}>
          {isOpen ? <MdClose /> : <HiMenuAlt3 />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gradient-to-b from-blue-900 to-cyan-800 text-white flex flex-col items-start p-6 space-y-4 shadow-lg animate-in slide-in-from-top">
          {/* Mobile Search */}
          <div className="w-full flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-2">
            <MdSearch className="text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70"
            />
          </div>

          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-lg font-medium w-full border-b border-white/10 pb-3 ${
                pathname === link.href ? "text-cyan-400" : "hover:text-cyan-300"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="w-full space-y-3 pt-3 border-t border-white/10">
              <Link href="/my-account" className="flex items-center gap-3 text-lg hover:text-cyan-300">
                <MdPerson className="text-xl" />
                Tài khoản
              </Link>
              <button onClick={logout} className="flex items-center gap-3 text-lg text-red-400 hover:text-red-500">
                <MdLogout className="text-xl" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3 pt-3 border-t border-white/10">
              <AuthDialog initialTab="login">
                <button className="flex items-center gap-3 text-lg hover:text-cyan-300">
                  <MdPerson className="text-xl" />
                  Đăng nhập
                </button>
              </AuthDialog>
              <AuthDialog initialTab="register">
                <button className="flex items-center gap-3 text-lg hover:text-cyan-300">
                  Đăng ký
                </button>
              </AuthDialog>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
