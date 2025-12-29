import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chatbotService";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      if (data?.response) {
        setMessages((prev) => [...prev, { role: "model", text: data.response }]);
      }
    } catch (error) {
      console.error(error);
      alert(typeof error === "string" ? error : "Đã xảy ra lỗi khi gọi chatbot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Hỏi Arigatou AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[420px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          <div className="px-3 py-2 border-b bg-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">Arigatou AI Assistant</span>
              <span className="text-[11px] text-slate-500">Hỏi về chuyến bay, đặt vé, hành lý, ...</span>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-xs"
            >
              Thu gọn
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.length === 0 && (
              <p className="text-[12px] text-slate-500">
                Xin chào! Mình có thể giúp bạn tra cứu chuyến bay, hỗ trợ đặt vé,
                quy định hành lý, và các câu hỏi khác về Arigatou Airlines.
              </p>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 text-[12px] rounded-2xl rounded-bl-none px-3 py-2">
                  Đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t px-3 py-2 bg-white flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
