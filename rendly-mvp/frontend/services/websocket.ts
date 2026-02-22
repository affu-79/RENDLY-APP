import io, { Socket } from "socket.io-client";
import { getResolvedApiUrl, apiUrlToWsUrl } from "@/lib/resolvedApiUrl";

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getResolvedApiUrl()
        .then(apiUrlToWsUrl)
        .then((WS_URL) => {
          this.socket = io(WS_URL, {
            auth: { token },
            path: "/socket.io",
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
          });
          this.socket.on("connect", () => {
            console.log("✅ Connected to Central Chat Server");
            resolve();
          });
          this.socket.on("connect_error", reject);
        })
        .catch(reject);
    });
  }

  joinConversation(conversationId: string, userId: string): void {
    this.socket?.emit("join:conversation", {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    contentType: string = "text"
  ): void {
    this.socket?.emit("message:send", {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      content_type: contentType,
    });
  }

  onMessageReceived(callback: (message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    content_type: string;
    created_at: string;
  }) => void): void {
    this.socket?.on("message:received", callback);
  }

  startTyping(conversationId: string, userId: string): void {
    this.socket?.emit("typing:start", {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  stopTyping(conversationId: string, userId: string): void {
    this.socket?.emit("typing:stop", {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  leaveConversation(conversationId: string, userId: string): void {
    this.socket?.emit("leave:conversation", {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocket = new WebSocketService();
export default websocket;
