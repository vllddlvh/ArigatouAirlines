"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated, getUser } from "../services/authService";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);

      if (userData?.isAdmin || userData?.roles?.includes("ADMIN")) {
        if (!router.pathname.startsWith('/admin')) {
          router.replace('/admin/dashboard');
        }
      }
    } else {
      // If not authenticated and not on admin page, show auth modal
      if (!router.pathname.startsWith('/admin')) {
        setIsAuthModalOpen(true);
      }
    }
    setLoading(false);
  }, [router.pathname]);

  const login = async (username, password, mode = "user") => {
    try {
      const data = await apiLogin(username, password);
      const userData = getUser() || { username };
      const isAdminUser = userData?.isAdmin || userData?.roles?.includes("ADMIN");

      // authService đã lưu token + user vào localStorage, ở đây chỉ cần sync lại state
      if (mode === "admin" && !isAdminUser) {
        apiLogout();
        setUser(null);
        throw "Tài khoản này không có quyền truy cập trang quản trị.";
      }

      if (mode === "user" && isAdminUser) {
        apiLogout();
        setUser(null);
        throw "Tài khoản admin chỉ được đăng nhập ở mục quản trị.";
      }

      setUser(userData);
      setIsAuthModalOpen(false);
      
      if (isAdminUser) {
        router.push("/admin");
      } else {
        const redirectTo = typeof window === "undefined" ? null : localStorage.getItem("postLoginRedirect");
        if (typeof window !== "undefined") {
          localStorage.removeItem("postLoginRedirect");
        }
        router.push(redirectTo || "/");
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      // payload: { email, username, password, fullName, phone, dateOfBirth, gender }
      const data = await apiRegister(payload);
      // Backend sign-up hiện không trả token, nên sau khi đăng ký xong
      // bạn có thể yêu cầu user tự đăng nhập lại.
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthModalOpen(true);
    router.push("/");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
