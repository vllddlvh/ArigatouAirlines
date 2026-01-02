// Export main classes

import { SocketManager } from "./socket-manager"
export { StompClientManager } from "./stomp-client"

// ================= CONFIG =================

const SOCKET_HTTP_URL =
  process.env.NEXT_PUBLIC_SOCKET_HTTP_URL || "http://localhost:8080/arigatouAirlines/ws"

// ================= SINGLETON =================

export const socketManager = new SocketManager({
  debug: process.env.NODE_ENV === "development",
  serverUrl: SOCKET_HTTP_URL,
})

// ================= CONVENIENCE FUNCTIONS =================

export const connectSocket = (userId, userName) =>
  socketManager.connect(userId, userName)

export const disconnectSocket = () =>
  socketManager.disconnect()

export const createChatSession = (receiverId) =>
  socketManager.createChatSession(receiverId)

export const subscribeToSession = (sessionId, callback) =>
  socketManager.subscribeToSession(sessionId, callback)

export const sendMessage = (
  sessionId,
  content,
  messageType = "text",
  metadata
) =>
  socketManager.sendMessage(
    sessionId,
    content,
    messageType,
    metadata
  )

export const leaveChatSession = (sessionId) =>
  socketManager.leaveChatSession(sessionId)

export const onNotification = (callback) =>
  socketManager.onNotification(callback)

export const onConnectionStatus = (callback) =>
  socketManager.onConnectionStatus(callback)
