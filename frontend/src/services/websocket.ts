/**
 * WebSocket Service for Real-time Scenario Interactions
 */

type MessageHandler = (message: any) => void
type ErrorHandler = (error: Event) => void
type CloseHandler = (event: CloseEvent) => void

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

class WebSocketService {
  private ws: WebSocket | null = null
  private messageHandlers: MessageHandler[] = []
  private errorHandlers: ErrorHandler[] = []
  private closeHandlers: CloseHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Connect to WebSocket
   */
  connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_URL}/ws/${sessionId}`)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.messageHandlers.forEach((handler) => handler(message))
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.errorHandlers.forEach((handler) => handler(error))
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket closed')
          this.closeHandlers.forEach((handler) => handler(event))

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            setTimeout(() => {
              console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
              this.connect(sessionId)
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Send message through WebSocket
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler)
  }

  /**
   * Remove message handler
   */
  offMessage(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
  }

  /**
   * Add error handler
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler)
  }

  /**
   * Add close handler
   */
  onClose(handler: CloseHandler): void {
    this.closeHandlers.push(handler)
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers = []
    this.errorHandlers = []
    this.closeHandlers = []
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
const wsService = new WebSocketService()

export default wsService
