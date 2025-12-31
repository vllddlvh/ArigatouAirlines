// services/ticketService.js
import axios from "axios";
import { API_BASE_URL, extractBody } from "@/lib/api";

// Helper để lấy headers chứa Token
const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ==========================================
// 1. TICKET CONTROLLER (/ticket)
// ==========================================

// GET /ticket/{bookingId}
export const getTicketsByBookingId = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticket/${bookingId}`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi lấy vé theo Booking ID ${bookingId}:`, error);
    throw error.response?.data?.message || "Không thể tải danh sách vé.";
  }
};

// ⚠️ LƯU Ý: Backend hiện tại CHƯA CÓ endpoint lấy vé theo Flight ID.
// Hàm này đang trả về mảng rỗng để tránh lỗi UI.
// Bạn cần thêm @GetMapping("/flight/{flightId}") vào TicketController Java.
export const getTicketsByFlight = async (flightId) => {
  try {
    // TODO: Khi backend update, bỏ comment dòng dưới:
    // const response = await axios.get(`${API_BASE_URL}/ticket/flight/${flightId}`, { headers: getHeaders() });
    // return extractBody(response);
    
    return []; // Trả về mảng rỗng giả lập
  } catch (error) {
    console.error(`Lỗi lấy vé theo Flight ID ${flightId}:`, error);
    return [];
  }
};


export const createTicketClass = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ticketClass`, data, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi tạo hạng vé:", error);
    throw error.response?.data?.message || "Tạo hạng vé thất bại.";
  }
};


export const getAllTicketClasses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticketClass`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi tải danh sách hạng vé:", error);
    throw error.response?.data?.message || "Không thể tải danh sách hạng vé.";
  }
};


export const getTicketClass = async (ticketClassId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticketClass/${ticketClassId}`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi lấy hạng vé ${ticketClassId}:`, error);
    throw error.response?.data?.message || "Không thể tải thông tin hạng vé.";
  }
};


export const updateTicketClass = async (ticketClassId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/ticketClass/${ticketClassId}`, data, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi cập nhật hạng vé ${ticketClassId}:`, error);
    throw error.response?.data?.message || "Cập nhật thất bại.";
  }
};


export const deleteTicketClass = async (ticketClassId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/ticketClass/${ticketClassId}`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi xóa hạng vé ${ticketClassId}:`, error);
    throw error.response?.data?.message || "Xóa thất bại.";
  }
};


// ==========================================
// 3. SEAT MAP CONTROLLER (/seatMap)
// ==========================================

// POST /seatMap - Tạo sơ đồ ghế (Admin)
export const createSeatMap = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/seatMap`, data, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi tạo sơ đồ ghế:", error);
    throw error.response?.data?.message || "Tạo sơ đồ ghế thất bại.";
  }
};

// GET SeatMap (Placeholder)
// Backend hiện tại CHỈ CÓ POST. Cần thêm GET để UI hiển thị sơ đồ.
export const getAircraftTypeWithLayout = async (aircraftTypeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aircraftType/${aircraftTypeId}`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi lấy sơ đồ ghế (Type ID: ${aircraftTypeId}):`, error);
    return null;
  }
};


// ==========================================
// 4. FLIGHT PRICE (Dành cho Dashboard quản lý giá)
// ==========================================

// GET /flightPrice/{flightId}
export const getFlightPrices = async (flightId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flightPrice/${flightId}`, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi lấy giá vé chuyến bay ${flightId}:`, error);
    // throw error; // Có thể throw hoặc return null tùy logic UI
    return null; 
  }
};

// POST /flightPrice - Tạo giá vé
export const createFlightPrice = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flightPrice`, data, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi tạo giá vé:", error);
    throw error.response?.data?.message || "Tạo giá vé thất bại.";
  }
};

// PUT /flightPrice/{flightPriceId} - Cập nhật giá vé
export const updateFlightPrice = async (flightPriceId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/flightPrice/${flightPriceId}`, data, {
      headers: getHeaders(),
    });
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi cập nhật giá vé ${flightPriceId}:`, error);
    throw error.response?.data?.message || "Cập nhật giá vé thất bại.";
  }
};

export const updateFlightPriceByClass = async (flightId, ticketClassId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/flightPrice/${flightId}/ticket-class/${ticketClassId}`, 
      data, 
      { headers: getHeaders() }
    );
    return extractBody(response);
  } catch (error) {
    console.error(`Lỗi cập nhật giá vé (Flight: ${flightId}, Class: ${ticketClassId}):`, error);
    throw error.response?.data?.message || "Cập nhật giá vé thất bại.";
  }
};