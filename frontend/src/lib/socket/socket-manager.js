import { StompClientManager } from "./stomp-client"
import { ChatSessionSocketSubscription } from "./subscriptions/chat-session-socket"

const DEFAULT_SOCKET_HTTP_URL =
  process.env.NEXT_PUBLIC_SOCKET_HTTP_URL || "http://localhost:8080/arigatouAirlines/ws"

export class SocketManager {
  clientManager
  chatSubscription = null

  config
  currentUser = null

  connectionStatus = {
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
  }

  connectionStatusCallbacks = []
  errorCallbacks = []

  reconnectTimer = null
  isReconnecting = false

  constructor(config = {}) {
    const serverUrl = config.serverUrl || DEFAULT_SOCKET_HTTP_URL

    this.config = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 10,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: false,
      ...config,
      serverUrl,
    }

    this.clientManager = new StompClientManager(this.config)
  }

  /* ================= CONNECT ================= */

  async connect(userId, userName) {
    this.currentUser = { userId, userName }

    if (this.clientManager.isConnected()) {
      this.log("Already connected")
      return
    }

    try {
      this.updateConnectionStatus({ connecting: true, error: undefined })

      const stompClient = await this.clientManager.connect(this.currentUser)

      this.chatSubscription = new ChatSessionSocketSubscription(
        stompClient,
        this.config.debug
      )

      this.updateConnectionStatus({
        connected: true,
        connecting: false,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      })

      this.log("Connected & subscriptions initialized")
    } catch (error) {
      this.handleConnectionError(`Connection failed: ${error}`)
      throw error
    }
  }

  disconnect() {
    this.clearReconnectTimer()
    this.isReconnecting = false

    this.chatSubscription?.unsubscribeAll()

    this.clientManager.disconnect()

    this.updateConnectionStatus({
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
    })

    this.log("Disconnected")
  }

  /* ================= CHAT ================= */

  async createChatSession(receiverId) {
    if (!this.chatSubscription || !this.currentUser) {
      throw new Error("Socket not initialized")
    }

    

    return this.chatSubscription.createChatSession(
      this.currentUser.userId,
      receiverId
    )
  }

  subscribeToSession(sessionId, callback) {
    if (!this.chatSubscription) {
      this.handleError("Chat subscription not initialized")
      return () => {}
    }


    return this.chatSubscription.subscribeToSession(sessionId, callback)
  }

  sendMessage(sessionId, content, messageType = "text", metadata) {
    if (!this.chatSubscription || !this.currentUser) {
      this.handleError("Cannot send message")
      return
    }

    this.chatSubscription.sendMessage(
      sessionId,
      content,
      this.currentUser,
      messageType,
      metadata
    )
  }

  leaveChatSession(sessionId) {
    if (!this.chatSubscription) {
      this.handleError("Chat subscription not initialized")
      return
    }

    this.chatSubscription.unsubscribeFromSession(sessionId)
    this.log(`Left session ${sessionId}`)
  }

  getActiveSessions() {
    return this.chatSubscription?.getActiveSessions() || []
  }

  onSessionCreated(callback) {
    if (!this.chatSubscription) {
      this.handleError("Chat subscription not initialized")
      return () => {}
    }

    return this.chatSubscription.onSessionCreated(callback)
  }

  subscribeToContactUpdates(userId, callback) {
  if (!this.stompClient.connected) return () => {};

  const topic = `/topic/contacts/${userId}`;
  const subscription = this.stompClient.subscribe(topic, (message) => {
    try {
      const update = JSON.parse(message.body);
      callback(update);
    } catch (error) {
      console.error("Failed to parse contact update", error);
    }
  });

  return () => subscription.unsubscribe();
}



  
  /* ================= STATUS ================= */

  onConnectionStatus(callback) {
    this.connectionStatusCallbacks.push(callback)
    callback(this.connectionStatus)

    return () => {
      this.connectionStatusCallbacks =
        this.connectionStatusCallbacks.filter(cb => cb !== callback)
    }
  }

  onError(callback) {
    this.errorCallbacks.push(callback)

    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback)
    }
  }

  getConnectionStatus() {
    return { ...this.connectionStatus }
  }

  getCurrentUser() {
    return this.currentUser ? { ...this.currentUser } : null
  }

  isConnected() {
    return this.connectionStatus.connected
  }

  /* ================= RECONNECT ================= */

  handleConnectionError(error) {
    this.updateConnectionStatus({
      connected: false,
      connecting: false,
      error,
    })

    this.handleError(error)
    this.attemptReconnect()
  }

  attemptReconnect() {
    if (
      this.isReconnecting ||
      this.connectionStatus.reconnectAttempts >=
        this.config.maxReconnectAttempts ||
      !this.currentUser
    ) {
      return
    }

    this.isReconnecting = true
    const attempts = this.connectionStatus.reconnectAttempts + 1

    this.updateConnectionStatus({ reconnectAttempts: attempts })

    this.log(
      `Reconnecting (${attempts}/${this.config.maxReconnectAttempts})`
    )

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(
          this.currentUser.userId,
          this.currentUser.userName
        )

        this.chatSubscription?.resubscribeAll()

        this.isReconnecting = false
        this.log("Reconnected successfully")
      } catch (error) {
        this.isReconnecting = false
        this.log("Reconnect failed", error)

        if (attempts < this.config.maxReconnectAttempts) {
          this.attemptReconnect()
        } else {
          this.handleError("Max reconnection attempts reached")
        }
      }
    }, this.config.reconnectDelay)
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  updateConnectionStatus(updates) {
    this.connectionStatus = { ...this.connectionStatus, ...updates }
    this.connectionStatusCallbacks.forEach(cb => cb(this.connectionStatus))
  }

  handleError(error) {
    this.log("Error:", error)
    this.errorCallbacks.forEach(cb => cb(error))
  }

  log(message, ...args) {
    if (this.config.debug) {
      console.log(`[SocketManager] ${message}`, ...args)
    }
  }
}
