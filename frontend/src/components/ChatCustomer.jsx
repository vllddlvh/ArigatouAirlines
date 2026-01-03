"use client"

import { useEffect, useState, useRef } from "react"
import { MessageCircle, Minimize2, Send, Loader2 } from "lucide-react"
import { socketManager } from "@/lib/socket"
import { fetchCustomerInfo } from "@/services/customerService"
// 1. Cập nhật import getOrCreateSession
import { fetchMessageHistory, getOrCreateSession } from "@/services/chatService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ADMIN_ID = 1 
const ADMIN_NAME = "Hỗ trợ viên"

export function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [user, setUser] = useState(null)
  
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const scrollRef = useRef(null)

  useEffect(() => {
    const initUser = async () => {
      try {
        const userInfo = await fetchCustomerInfo()
        setUser(userInfo)
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error)
      }
    }
    initUser()
  }, [])

  // Logic kết nối Socket và lấy Session qua API
  useEffect(() => {
    if (!isOpen || !user) return

    const setupChatSession = async () => {
      setIsInitializing(true)
      try {
        // Bước 1: Kết nối Socket (vẫn cần để nhận tin nhắn realtime)
        if (!socketManager.isConnected()) {
           await socketManager.connect(user.userId, user.lastName)
        }
        setIsConnected(true)

        // Bước 2: Gọi API HTTP để lấy Session ID (Thay cho socketManager.createChatSession)
        // user.userId là người gửi, ADMIN_ID là người nhận
        const session = await getOrCreateSession(user.userId, ADMIN_ID)

        console.log("Session Info:", session)
        
        if (session && session.sessionId) {
            setSessionId(session.sessionId)
            
            // Bước 3: Load lịch sử tin nhắn
            const history = await fetchMessageHistory(session.sessionId)
            setMessages(history || [])
        }

      } catch (error) {
        console.error("Setup chat thất bại:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    setupChatSession()

    const removeStatusListener = socketManager.onConnectionStatus((status) => {
        setIsConnected(status.connected)
    })

    return () => {
        removeStatusListener()
    }
  }, [isOpen, user])

  // Subscribe nhận tin nhắn mới (Chạy khi có sessionId và Socket đã connect)
  useEffect(() => {
    if (!sessionId || !isConnected) return
    
    const unsubscribe = socketManager.subscribeToSession(sessionId, (newMessage) => {
        setMessages((prev) => [...prev, newMessage])
        scrollToBottom()
    })

    return () => {
        unsubscribe()
        // Khi đóng widget hoặc đổi session thì leave
        socketManager.leaveChatSession(sessionId)
    }
  }, [sessionId, isConnected])

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionId || !isConnected) return

    try {
        socketManager.sendMessage(sessionId, inputValue)
        setInputValue("")
    } catch (error) {
        console.error("Gửi tin nhắn lỗi:", error)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-14 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 z-50"
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[350px] h-[500px] flex flex-col shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 border-0 overflow-hidden">
      
      {/* Header */}
      <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src="/admin-avatar.png" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                {isConnected && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                )}
            </div>
            <div>
                <h3 className="font-bold text-sm">{ADMIN_NAME}</h3>
                <p className="text-xs text-blue-100">
                    {isInitializing ? "Đang kết nối..." : "Sẵn sàng hỗ trợ"}
                </p>
            </div>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-blue-700" onClick={() => setIsOpen(false)}>
                <Minimize2 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 bg-gray-50 overflow-y-auto custom-scrollbar">
        {isInitializing && !sessionId ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm">Đang kết nối...</p>
             </div>
        ) : (
            <div className="space-y-4">
                <div className="flex justify-start">
                     <div className="bg-white border text-gray-800 rounded-2xl rounded-tl-none py-2 px-3 text-sm max-w-[80%] shadow-sm">
                        Xin chào! Tôi có thể giúp gì cho bạn?
                     </div>
                </div>

                {messages.map((msg, index) => {
                    const isMe = msg.senderId != ADMIN_ID;
                    return (
                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`py-2 px-3 text-sm max-w-[80%] shadow-sm break-words ${
                                    isMe 
                                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                                    : "bg-white border text-gray-800 rounded-2xl rounded-tl-none"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={scrollRef} />
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="focus-visible:ring-blue-500"
                disabled={!isConnected || isInitializing}
            />
            <Button 
                type="submit" 
                size="icon" 
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
                disabled={!inputValue.trim() || !isConnected}
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </Card>
  )
}