import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

export class StompClientManager {
  stompClient
  config

  constructor(config) {
    this.config = config

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.config.serverUrl),

      debug: this.config.debug
        ? (str) => console.log("[StompClient]", str)
        : undefined,

      reconnectDelay: this.config.reconnectDelay,
      heartbeatIncoming: this.config.heartbeatIncoming,
      heartbeatOutgoing: this.config.heartbeatOutgoing,
    })
  }

  connect(userInfo) {
    return new Promise((resolve, reject) => {
      this.stompClient.connectHeaders = {
        userId: String(userInfo.userId),
        userName: userInfo.userName,
      }

      this.stompClient.onConnect = () => {
        this.log("Connected to WebSocket server")
        resolve(this.stompClient)
      }

      this.stompClient.onStompError = (frame) => {
        this.log("STOMP Error", frame)
        reject(new Error(`STOMP error: ${frame.body}`))
      }

      this.stompClient.onWebSocketError = (error) => {
        this.log("WebSocket Error", error)
        reject(new Error(`WebSocket error: ${error}`))
      }

      this.stompClient.activate()
    })
  }

  disconnect() {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate()
      this.log("Disconnected from WebSocket server")
    }
  }

  isConnected() {
    return !!this.stompClient?.connected
  }

  getClient() {
    return this.stompClient
  }

  log(message, ...args) {
    if (this.config.debug) {
      console.log(`[StompClient] ${message}`, ...args)
    }
  }
}
