import axios from "axios";
import { API_BASE_URL, extractBody } from "@/lib/api";

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
