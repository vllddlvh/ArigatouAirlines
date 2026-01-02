"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchCustomerInfo } from "@/services/customerService"
import { socketManager } from "@/lib/socket"
import {fetchMessageHistory} from "@/services/chatService"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { Card } from "@/components/ui/card"

export function ChatWindow({ sessionId, receiverName, receiverAvatar, onBack }) {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
  })

  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)


  // Lấy user hiện tại
  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await fetchCustomerInfo()
        setUser(u)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    }

    loadUser()
  }, [])

  // Load message history
  useEffect(() => {
    if (!sessionId) return

    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const history = await fetchMessageHistory(sessionId)
        setMessages(history || [])
      } catch (error) {
        console.error("Failed to load message history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [sessionId])

  // Socket connection
  useEffect(() => {
    if (!user) return

    const initSocket = async () => {
      try {
        await socketManager.connect(user.userId, user.lastName)
        socketManager.onConnectionStatus((status) => {
          setConnectionStatus(status)
        })
      } catch (error) {
        console.error("Socket connection failed:", error)
      }
    }

    initSocket()

    return () => {
      socketManager.disconnect()
    }
  }, [user])

  // Subscribe messages
  useEffect(() => {
  if (!sessionId || !connectionStatus.connected) return

  const unsubscribeMessage = socketManager.subscribeToSession(
    sessionId,
    (message) => {
      setMessages((prev) => [...prev, message])
    }
  )

  return () => {
    unsubscribeMessage()
    socketManager.leaveChatSession(sessionId)
  }
}, [sessionId, connectionStatus.connected])

  const handleSendMessage = useCallback(
    async (content) => {
      if (!user || !sessionId || !connectionStatus.connected) return

      try {
        socketManager.sendMessage(sessionId, content)
      } catch (error) {
        console.error("Failed to send message:", error)
      }
    },
    [user, sessionId, connectionStatus.connected]
  )

  if (!user) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <p className="text-gray-500">Loading user info...</p>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <ChatHeader
        receiverName={receiverName}
        receiverAvatar={receiverAvatar}
        isOnline={connectionStatus.connected}
        onBack={onBack}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading messages...</p>
        </div>
      ) : (
        <MessageList messages={messages} currentUserId={user.userId} />
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!connectionStatus.connected || !sessionId}
      />

      {!connectionStatus.connected && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <p className="text-sm text-yellow-800">
            {connectionStatus.connecting
              ? "Connecting to chat..."
              : "Disconnected from chat"}
          </p>
        </div>
      )}
    </Card>
  )
}
