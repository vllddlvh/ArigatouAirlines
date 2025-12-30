import axios from 'axios';
import { API_BASE_URL, getAuthHeader, extractBody } from '@/lib/api';

export const createBooking = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/booking`, data, {
            headers: getAuthHeader()
        });
        return extractBody(response);
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export const getAllBookings = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/booking`, {
            headers: getAuthHeader()
        });
        return extractBody(response);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const getMyBookings = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/booking/my`, {
            headers: getAuthHeader()
        });
        return extractBody(response);
    } catch (error) {
        console.error('Error fetching my bookings:', error);
        throw error;
    }
};

export const getBookingById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/booking/${id}`, {
            headers: getAuthHeader()
        });
        return extractBody(response);
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

export const confirmPayment = async (id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/booking/${id}/confirm-payment`, {}, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

export const cancelBooking = async (id) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/booking/${id}/cancel`, {}, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};
