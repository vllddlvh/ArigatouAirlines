import axios from 'axios';
import { API_BASE_URL, getAuthHeader, extractBody } from '@/lib/api';

/**
 * ADMIN – Tạo dịch vụ bổ sung mới
 */
export const createAncillaryService = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/ancillaryService`,
            data,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error('Error creating ancillary service:', error);
        throw error;
    }
};

/**
 * PUBLIC – Lấy tất cả dịch vụ bổ sung
 */
export const getAllAncillaryServices = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/ancillaryService`,
             { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error('Error fetching ancillary services:', error);
        throw error;
    }
};


/**
 * PUBLIC – Lấy chi tiết 1 dịch vụ
 */
export const getAncillaryServiceById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/ancillaryService/${id}`,
             { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error(`Error fetching ancillary service ${id}:`, error);
        throw error;
    }
};

/**
 * ADMIN – Cập nhật dịch vụ
 */
export const updateAncillaryService = async (id, data) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/ancillaryService/${id}`,
            data,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error(`Error updating ancillary service ${id}:`, error);
        throw error;
    }
};

/**
 * ADMIN – Xóa dịch vụ
 */
export const deleteAncillaryService = async (id) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/ancillaryService/${id}`,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error(`Error deleting ancillary service ${id}:`, error);
        throw error;
    }
};


/**
 * ADMIN / STAFF – Lấy tất cả booking services
 * (mỗi record = 1 dịch vụ gắn với 1 booking + ticket)
 */
export const getAllBookingServices = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/booking-service`,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error('Error fetching booking services:', error);
        throw error;
    }
};

/**
 * ADMIN / STAFF – Lấy chi tiết 1 booking service theo ID
 */
export const getBookingServiceById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/booking-service/${id}`,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error(`Error fetching booking service ${id}:`, error);
        throw error;
    }
};


/**
 * Tạo mới Booking Service (Thêm dịch vụ cho 1 vé cụ thể)
 * @param {Object} data - { ticketId, serviceId, priceAtPurchase }
 */
export const createBookingService = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/booking-service`,
            data,
            { headers: getAuthHeader() }
        );
        return extractBody(response);
    } catch (error) {
        console.error('Error creating booking service:', error);
        throw error;
    }
};