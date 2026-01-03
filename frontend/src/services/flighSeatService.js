import axios from 'axios';
import { API_BASE_URL, getAuthHeader, extractBody } from '@/lib/api';

/**
 * Lấy thông tin chi tiết của một ghế chuyến bay dựa trên ID
 * Endpoint: GET /flightSeat/{flightSeatId}
 * * @param {number|string} flightSeatId - ID của ghế chuyến bay
 * @returns {Promise<Object>} - Dữ liệu FlightSeatResponse
 */
export const getFlightSeatById = async (flightSeatId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/flightSeat/${flightSeatId}`, 
            {
                headers: getAuthHeader()
            }
        );
        return extractBody(response);
    } catch (error) {
        console.error(`Error getting flight seat with id ${flightSeatId}:`, error);
        throw error;
    }
};