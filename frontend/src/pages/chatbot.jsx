import React, { useState } from "react";
import { sendChatMessage } from "../services/chatbotService";

function ChatbotPage() {
  const [messages, setMessages] = useState([]); // { role: "user" | "model", text: string }
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newUserMessage = { role: "user", text: trimmed };
    const newHistory = [...messages, newUserMessage];

    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const historyForApi = newHistory.map((m) => ({ role: m.role, text: m.text }));
      const data = await sendChatMessage(trimmed, historyForApi);

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-100 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Arigatou AI Assistant</h1>
          <span className="text-xs text-slate-500">Powered by Google Gemini</span>
        </div>

        <div className="flex-1 h-[60vh] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">
              Hãy bắt đầu bằng cách nhập câu hỏi của bạn về chuyến bay, đặt vé, hành lý, v.v.
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 text-sm rounded-2xl rounded-bl-none px-3 py-2">
                Đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t px-4 py-3 bg-white flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatbotPage;
