import axios from "axios";
import { API_BASE_URL, extractBody, getAuthHeader } from "@/lib/api";

// ==================== VOUCHER ====================

export const getAllVouchers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vouchers`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    throw (
      error.response?.data?.message ||
      "Đã xảy ra lỗi khi lấy danh sách voucher."
    );
  }
};

export const getVoucherById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin voucher:", error);
    throw (
      error.response?.data?.message ||
      "Đã xảy ra lỗi khi lấy thông tin voucher."
    );
  }
};

export const createVoucher = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/vouchers`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    throw (
      error.response?.data?.message ||
      "Đã xảy ra lỗi khi tạo voucher."
    );
  }
};

export const updateVoucher = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/vouchers/${id}`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    throw (
      error.response?.data?.message ||
      "Đã xảy ra lỗi khi cập nhật voucher."
    );
  }
};

export const deleteVoucher = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    throw (
      error.response?.data?.message ||
      "Đã xảy ra lỗi khi xóa voucher."
    );
  }
};
