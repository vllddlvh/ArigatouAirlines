import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '@/lib/api';

export const getAllAncillaryServices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ancillaryService`, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error fetching ancillary services:', error);
    throw error;
  }
};

export const createAncillaryService = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ancillaryService`, payload, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error creating ancillary service:', error);
    throw error;
  }
};

export const updateAncillaryService = async (serviceId, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/ancillaryService/${serviceId}`, payload, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error updating ancillary service:', error);
    throw error;
  }
};

export const deleteAncillaryService = async (serviceId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/ancillaryService/${serviceId}`, {
      headers: getAuthHeader(),
    });
    return response.data.body;
  } catch (error) {
    console.error('Error deleting ancillary service:', error);
    throw error;
  }
};
