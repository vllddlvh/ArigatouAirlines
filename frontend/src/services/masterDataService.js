import axios from "axios";
import { API_BASE_URL, extractBody, getAuthHeader } from "@/lib/api";

// ==================== AIRCRAFT ====================

export const getAllAircrafts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aircraft`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách máy bay.";
  }
};

export const getAircraftById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aircraft/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy thông tin máy bay.";
  }
};

export const createAircraft = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/aircraft`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi tạo máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi tạo máy bay.";
  }
};

export const updateAircraft = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/aircraft/${id}`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật máy bay.";
  }
};

export const deleteAircraft = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/aircraft/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi xóa máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi xóa máy bay.";
  }
};

// ==================== AIRCRAFT TYPE ====================

export const getAllAircraftTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aircraftType`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách loại máy bay.";
  }
};

export const getAircraftTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aircraftType/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin loại máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy thông tin loại máy bay.";
  }
};

export const createAircraftType = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/aircraftType`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi tạo loại máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi tạo loại máy bay.";
  }
};

export const updateAircraftType = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/aircraftType/${id}`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật loại máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật loại máy bay.";
  }
};

export const deleteAircraftType = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/aircraftType/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi xóa loại máy bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi xóa loại máy bay.";
  }
};

// ==================== AIRLINE ====================

export const getAllAirlines = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airline`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hãng hàng không:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách hãng hàng không.";
  }
};

export const getAirlineById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airline/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin hãng hàng không:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy thông tin hãng hàng không.";
  }
};

export const createAirline = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/airline`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi tạo hãng hàng không:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi tạo hãng hàng không.";
  }
};

export const updateAirline = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/airline/${id}`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật hãng hàng không:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hãng hàng không.";
  }
};

export const deleteAirline = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/airline/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi xóa hãng hàng không:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi xóa hãng hàng không.";
  }
};

// ==================== FLIGHT SCHEDULE ====================

export const getAllFlights = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flight`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chuyến bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách chuyến bay.";
  }
};

export const getFlightById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flight/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin chuyến bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi lấy thông tin chuyến bay.";
  }
};

export const createFlight = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flight`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi tạo chuyến bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi tạo chuyến bay.";
  }
};

export const updateFlight = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/flight/${id}`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật chuyến bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật chuyến bay.";
  }
};

export const deleteFlight = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/flight/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi xóa chuyến bay:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi xóa chuyến bay.";
  }
};
