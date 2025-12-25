import axios from "axios";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const normalizeApiBaseUrl = (baseUrl) => {
  const trimmed = String(baseUrl || "http://localhost:8080").replace(/\/+$/, "");
  if (trimmed.endsWith("/arigatouAirlines")) return trimmed;
  return `${trimmed}/arigatouAirlines`;
};
const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

const extractBody = (response) => {
  if (response?.data?.body !== undefined) return response.data.body;
  return response.data;
};

export const sendChatMessage = async (message, history = []) => {
  try {
    const payload = {
      message,
      history,
    };

    const response = await axios.post(`${API_BASE_URL}/chatbot/ask`, payload);
    return extractBody(response);
  } catch (error) {
    console.error("Lỗi khi gọi chatbot:", error);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi gọi chatbot.";
  }
};
