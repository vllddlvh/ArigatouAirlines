import axios from "axios";
import { API_BASE_URL, extractBody } from "@/lib/api";

const parseJwt = (token) => {
  try {
    if (typeof window === "undefined") return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Không thể phân tích JWT:", error);
    return null;
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });

    const body = extractBody(response);

    if (body?.token) {
      localStorage.setItem("token", body.token);

      let userInfo = { username };

      const payload = parseJwt(body.token);
      if (payload?.scope) {
        const scopes = String(payload.scope).split(" ").filter(Boolean);
        const roles = scopes
          .filter((item) => item.startsWith("ROLE_"))
          .map((item) => item.replace("ROLE_", ""));
        const permissions = scopes.filter((item) => !item.startsWith("ROLE_"));

        userInfo = {
          ...userInfo,
          roles,
          permissions,
          isAdmin: roles.includes("ADMIN"),
        };
      }

      // Lưu thông tin cơ bản để hiện trên navbar
      localStorage.setItem(
        "user",
        JSON.stringify(userInfo)
      );
    }

    return body;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
  }
};

// Đăng ký user mới qua /users/sign-up (theo UserCreationRequest của backend)
// Ở đây tạm thởi nhận vào một object chứa đủ thông tin tối thiểu.
export const register = async (payload) => {
  // payload: { email, username, password, fullName, phone, dateOfBirth, gender }
  try {
    const response = await axios.post(`${API_BASE_URL}/users/sign-up`, payload);

    const body = extractBody(response);

    // API sign-up hiện không trả về token, nên chỉ trả body cho UI xử lý.
    return body;
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    throw error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};
