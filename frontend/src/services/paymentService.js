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
