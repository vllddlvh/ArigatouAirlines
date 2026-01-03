import axios from 'axios';
import { API_BASE_URL, getAuthHeader, extractBody } from '@/lib/api';

/**
 * Gửi tin nhắn
 * @param {Object} data ChatMessageRequest: { sessionId, senderId, receiverId, content }
 * @returns {Promise<ChatMessageResponse>}
 */
export const sendMessage = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/messages`, data, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Lấy danh sách message trong một session
 * @param {string} sessionId UUID của chat session
 * @returns {Promise<ChatMessageResponse[]>}
 */
export const fetchMessageHistory = async (sessionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
      headers: getAuthHeader(),
    });
    return extractBody(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Tạo hoặc lấy session giữa 2 user
 * @param {number} userAId
 * @param {number} userBId
 * @returns {Promise<ChatSessionResponse>}
 */
export const getOrCreateSession = async (userAId, userBId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/sessions`, {
      headers: getAuthHeader(),
      params: { userAId, userBId },
    });
    return extractBody(response);
  } catch (error) {
    console.error('Error getting or creating session:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả message đã đọc
 * @param {string} sessionId UUID session
 * @param {number} receiverId
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (sessionId, receiverId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/sessions/${sessionId}/mark-read`, null, {
      headers: getAuthHeader(),
      params: { receiverId },
    });
    return extractBody(response);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Lấy danh bạ contact
 * @param {number} currentUserId
 * @returns {Promise<ContactResponse[]>}
 */
export const getContacts = async (currentUserId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/contacts`, {
      headers: getAuthHeader(),
      params: { currentUserId },
    });
    return extractBody(response);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};
