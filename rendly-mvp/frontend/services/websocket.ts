import io, { Socket } from "socket.io-client";
import { getCcsWsUrl } from "@/lib/resolvedApiUrl";

function getWsUrl(): Promise<string> {
  return getCcsWsUrl();
}

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getWsUrl().then((WS_URL) => {
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

  /** Remove a previously registered message:received listener (for effect cleanup). */
  offMessageReceived(callback: (message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    content_type: string;
    created_at: string;
  }) => void): void {
    this.socket?.off("message:received", callback);
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

  emitConversationRead(conversationId: string, userId: string): void {
    this.socket?.emit("conversation:read", {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  onConversationRead(callback: (payload: { conversation_id: string; user_id: string }) => void): void {
    this.socket?.on("conversation:read", callback);
  }

  onTypingIndicator(callback: (payload: { conversation_id?: string; user_id: string; typing: boolean }) => void): void {
    this.socket?.off("typing:indicator");
    this.socket?.on("typing:indicator", callback);
  }

  onMessageDeleted(callback: (payload: { conversation_id: string; message_ids: string[] }) => void): void {
    this.socket?.on("message:deleted", callback);
  }

  onUserOnline(callback: (payload: { user_id: string }) => void): void {
    this.socket?.off("user:online");
    this.socket?.on("user:online", callback);
  }

  onUserOffline(callback: (payload: { user_id: string }) => void): void {
    this.socket?.off("user:offline");
    this.socket?.on("user:offline", callback);
  }

  // Call signaling (1:1 audio/video)
  emitCallStart(conversationId: string, callType: string, initiatorId: string, callLogId?: string): void {
    this.socket?.emit("call:start", {
      conversation_id: conversationId,
      call_type: callType,
      initiator_id: initiatorId,
      call_log_id: callLogId ?? undefined,
    });
  }

  emitCallAccept(conversationId: string, userId: string, callLogId?: string): void {
    this.socket?.emit("call:accept", {
      conversation_id: conversationId,
      user_id: userId,
      call_log_id: callLogId ?? undefined,
    });
  }

  emitCallReject(conversationId: string, callLogId?: string, userId?: string): void {
    this.socket?.emit("call:reject", {
      conversation_id: conversationId,
      call_log_id: callLogId ?? undefined,
      user_id: userId ?? undefined,
    });
  }

  emitCallEnd(conversationId: string, callLogId?: string, status?: string, userId?: string): void {
    this.socket?.emit("call:end", {
      conversation_id: conversationId,
      call_log_id: callLogId ?? undefined,
      status: status ?? "completed",
      user_id: userId ?? undefined,
    });
  }

  emitWebrtcOffer(conversationId: string, userId: string, sdp: RTCSessionDescriptionInit): void {
    this.socket?.emit("webrtc:offer", { conversation_id: conversationId, user_id: userId, sdp });
  }

  emitWebrtcAnswer(conversationId: string, userId: string, sdp: RTCSessionDescriptionInit): void {
    this.socket?.emit("webrtc:answer", { conversation_id: conversationId, user_id: userId, sdp });
  }

  emitWebrtcIceCandidate(conversationId: string, userId: string, candidate: RTCIceCandidateInit): void {
    this.socket?.emit("webrtc:ice-candidate", {
      conversation_id: conversationId,
      user_id: userId,
      candidate,
    });
  }

  onCallIncoming(callback: (payload: {
    conversation_id: string;
    call_type: string;
    initiator_id: string;
    call_log_id: string | null;
  }) => void): void {
    this.socket?.off("call:incoming");
    this.socket?.on("call:incoming", callback);
  }

  onCallAccepted(callback: (payload: {
    conversation_id: string;
    call_log_id: string | null;
    callee_id: string;
  }) => void): void {
    this.socket?.off("call:accepted");
    this.socket?.on("call:accepted", callback);
  }

  onCallRejected(callback: (payload: { conversation_id: string; call_log_id: string | null }) => void): void {
    this.socket?.off("call:rejected");
    this.socket?.on("call:rejected", callback);
  }

  onCallEnded(callback: (payload: {
    conversation_id: string;
    call_log_id: string | null;
    status: string;
  }) => void): void {
    this.socket?.off("call:ended");
    this.socket?.on("call:ended", callback);
  }

  onWebrtcOffer(callback: (payload: { conversation_id: string; user_id: string; sdp: RTCSessionDescriptionInit }) => void): void {
    this.socket?.off("webrtc:offer");
    this.socket?.on("webrtc:offer", callback);
  }

  onWebrtcAnswer(callback: (payload: { conversation_id: string; user_id: string; sdp: RTCSessionDescriptionInit }) => void): void {
    this.socket?.off("webrtc:answer");
    this.socket?.on("webrtc:answer", callback);
  }

  onWebrtcIceCandidate(callback: (payload: {
    conversation_id: string;
    user_id: string;
    candidate: RTCIceCandidateInit;
  }) => void): void {
    this.socket?.off("webrtc:ice-candidate");
    this.socket?.on("webrtc:ice-candidate", callback);
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
