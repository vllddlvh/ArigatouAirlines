import axios from "axios";
import { API_BASE_URL, getAuthHeader, extractBody } from "@/lib/api";

/**
 * Confirm payment for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<Object>} - Updated booking data
 */
export const confirmPayment = async (bookingId, voucherCode = null) => {
  const payload = voucherCode ? { voucherCode } : {};
  const response = await axios.put(
    `${API_BASE_URL}/booking/${bookingId}/confirm-payment`,
    payload,
    {
      headers: getAuthHeader(),
    }
  );
  return extractBody(response);
};

/**
 * Get payment status for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<Object>} - Payment status data
 */
export const getPaymentStatus = async (bookingId) => {
  const response = await axios.get(
    `${API_BASE_URL}/booking/${bookingId}/payment-status`,
    {
      headers: getAuthHeader(),
    }
  );
  return extractBody(response);
};

/**
 * Cancel payment for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<Object>} - Updated booking data
 */
export const cancelPayment = async (bookingId) => {
  const response = await axios.put(
    `${API_BASE_URL}/booking/${bookingId}/cancel`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return extractBody(response);
};


/**
 * Tạo URL thanh toán VNPAY
 * Gọi đến API: GET /payment/create_payment
 * @param {number} amount - Số tiền cần thanh toán (Optional: tùy vào backend có nhận hay không)
 * @returns {Promise<Object>} - Trả về object chứa URL thanh toán (PaymentResponse)
 */
export const createVnPayUrl  = async (bookingId, voucherCode = null, voucherId = null) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/create_payment`, 
      {
        headers: getAuthHeader(),
        params: {
          bookingId: bookingId,
          voucherCode: voucherCode,
          voucherId: voucherId
        }
      }
    );
    return extractBody(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Gửi thông tin trả về từ VNPAY về Backend để xác thực
 * Gọi đến API: GET /payment/payment_info
 * @param {Object} params - Object chứa các tham số từ URL (vnp_Amount, vnp_ResponseCode,...)
 * @returns {Promise<Object>} - Kết quả giao dịch (TransactionStatus)
 */
export const verifyVnPayReturn = async (params) => {
  const response = await axios.get(
    `${API_BASE_URL}/payment/payment_info`,
    {
      headers: getAuthHeader(),
      params: params, // Axios sẽ tự động chuyển object này thành query string (?vnp_Amount=...&vnp_...)
    }
  );
  return extractBody(response);
};