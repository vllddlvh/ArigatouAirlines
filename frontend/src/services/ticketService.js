import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '@/lib/api';

export const getAllTickets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tickets`, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

export const getTicketById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tickets/${id}`, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
};

export const getTicketsByBookingId = async (bookingId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tickets/booking/${bookingId}`, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error fetching tickets by booking:', error);
        throw error;
    }
};

export const getTicketsByFlightId = async (flightId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tickets/flight/${flightId}`, {
            headers: getAuthHeader()
        });
        return response.data.body;
    } catch (error) {
        console.error('Error fetching tickets by flight:', error);
        throw error;
    }
};
