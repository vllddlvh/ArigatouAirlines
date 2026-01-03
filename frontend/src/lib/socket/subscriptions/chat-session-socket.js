import { Client } from "@stomp/stompjs"

export class ChatSessionSocketSubscription {
  constructor(stompClient, debug = false) {
    this.stompClient = stompClient
    this.debug = debug

    this.sessionSubscriptions = new Map()
    this.messageCallbacks = new Map()
    this.sessionCallbacks = []
  }

  /**
   * Create a new chat session between two users
   */
  async createChatSession(senderId, receiverId) {
    return new Promise((resolve, reject) => {
      if (!this.stompClient.connected) {
        reject(new Error("Cannot create chat session: not connected"))
        return
      }

      const destination = "/app/chat/session/create"
      const sessionRequest = {
        senderId,
        receiverId,
        timestamp: new Date().toISOString(),
      }

      // Subscribe to session creation response
      const responseSubscription = this.stompClient.subscribe(
        "/user/queue/session/created",
        (message) => {
          try {
            const session = JSON.parse(message.body)
            this.log("Chat session created:", session)

            // Notify callbacks
            this.sessionCallbacks.forEach((callback) => callback(session))

            responseSubscription.unsubscribe()
            resolve(session.sessionId)
          } catch (error) {
            this.log("Failed to parse session creation response:", error)
            responseSubscription.unsubscribe()
            reject(error)
          }
        }
      )

      try {
        this.stompClient.publish({
          destination,
          body: JSON.stringify(sessionRequest),
        })
        this.log("Sent session creation request:", sessionRequest)
      } catch (error) {
        responseSubscription.unsubscribe()
        reject(error)
      }
    })
  }

  /**
   * Subscribe to messages in a chat session
   */
  subscribeToSession(sessionId, callback) {
    if (!this.stompClient.connected) {
      this.log("Cannot subscribe to session: not connected")
      return () => {}
    }

    // Add callback
    if (!this.messageCallbacks.has(sessionId)) {
      this.messageCallbacks.set(sessionId, [])
    }
    this.messageCallbacks.get(sessionId).push(callback)

    // Create subscription if not exists
    if (!this.sessionSubscriptions.has(sessionId)) {
      const topic = `/topic/chat/${sessionId}`

      try {
        const subscription = this.stompClient.subscribe(topic, (message) => {
          try {
            const chatMessage = JSON.parse(message.body)
            this.log("Received message in session:", chatMessage)

            const callbacks = this.messageCallbacks.get(sessionId) || []
            callbacks.forEach((cb) => cb(chatMessage))
          } catch (error) {
            this.log(
              `Failed to parse message in session ${sessionId}:`,
              error
            )
          }
        })

        this.sessionSubscriptions.set(sessionId, subscription)
        this.log(`Subscribed to chat session: ${topic}`)
      } catch (error) {
        this.log(`Failed to subscribe to session ${sessionId}:`, error)
      }
    }

    // Unsubscribe handler
    return () => {
      const callbacks = this.messageCallbacks.get(sessionId) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)

      if (callbacks.length === 0) {
        this.unsubscribeFromSession(sessionId)
      }
    }
  }

  /**
   * Send message to a chat session
   */
  sendMessage(sessionId, content, userInfo, messageType = "text", metadata) {
    if (!this.stompClient.connected) {
      this.log("Cannot send message: not connected")
      return
    }

    const destination = `/app/chat/session/${sessionId}`
    const messageData = {
      sessionId,
      senderId: userInfo.userId,
      senderName: userInfo.userName,
      content,
      messageType,
      metadata,
    }

    try {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(messageData),
      })
      this.log(`Sent message to session ${sessionId}:`, messageData)
    } catch (error) {
      this.log(`Failed to send message to session ${sessionId}:`, error)
    }
  }

  /**
   * Unsubscribe from a specific chat session
   */
  unsubscribeFromSession(sessionId) {
    const subscription = this.sessionSubscriptions.get(sessionId)
    if (subscription) {
      subscription.unsubscribe()
      this.sessionSubscriptions.delete(sessionId)
      this.messageCallbacks.delete(sessionId)
      this.log(`Unsubscribed from chat session: ${sessionId}`)
    }
  }

  /**
   * Add callback for session creation events
   */
  onSessionCreated(callback) {
    this.sessionCallbacks.push(callback)

    return () => {
      const index = this.sessionCallbacks.indexOf(callback)
      if (index > -1) this.sessionCallbacks.splice(index, 1)
    }
  }

  /**
   * Get all active session IDs
   */
  getActiveSessions() {
    return Array.from(this.sessionSubscriptions.keys())
  }

  /**
   * Resubscribe to all active sessions
   */
  resubscribeAll() {
    const sessionIds = Array.from(this.messageCallbacks.keys())

    this.sessionSubscriptions.forEach((sub) => sub.unsubscribe())
    this.sessionSubscriptions.clear()

    for (const sessionId of sessionIds) {
      const callbacks = this.messageCallbacks.get(sessionId) || []
      if (!callbacks.length) continue

      const topic = `/topic/chat/${sessionId}`

      try {
        const subscription = this.stompClient.subscribe(topic, (message) => {
          try {
            const chatMessage = JSON.parse(message.body)
            callbacks.forEach((cb) => cb(chatMessage))
          } catch (error) {
            this.log(
              `Failed to parse message in session ${sessionId}:`,
              error
            )
          }
        })

        this.sessionSubscriptions.set(sessionId, subscription)
        this.log(`Resubscribed to chat session: ${topic}`)
      } catch (error) {
        this.log(`Failed to resubscribe to session ${sessionId}:`, error)
      }
    }
  }

  /**
   * Unsubscribe from all sessions
   */
  unsubscribeAll() {
    this.sessionSubscriptions.forEach((sub) => sub.unsubscribe())
    this.sessionSubscriptions.clear()
    this.messageCallbacks.clear()
    this.sessionCallbacks = []
    this.log("Unsubscribed from all chat sessions")
  }

  log(message, ...args) {
    if (this.debug) {
      console.log(`[ChatSessionSocket] ${message}`, ...args)
    }
  }
}
