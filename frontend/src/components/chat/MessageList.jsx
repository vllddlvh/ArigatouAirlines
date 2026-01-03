"use client"

import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"

export function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!currentUserId) return null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={String(message.senderId) === String(currentUserId)}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
