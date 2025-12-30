import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '@/lib/api';

export const validateVoucher = async ({ voucherCode, orderAmount }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/vouchers/validate`,
      { voucherCode, orderAmount },
      { headers: getAuthHeader() }
    );
    return response.data.body;
  } catch (error) {
    console.error('Error validating voucher:', error);
    throw error;
  }
};

export const getAllVouchers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vouchers`, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

export const createVoucher = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/vouchers`, payload, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};

export const updateVoucher = async (voucherId, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/vouchers/${voucherId}`, payload, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error updating voucher:', error);
    throw error;
  }
};

export const deleteVoucher = async (voucherId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/vouchers/${voucherId}`, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error deleting voucher:', error);
    throw error;
  }
};
