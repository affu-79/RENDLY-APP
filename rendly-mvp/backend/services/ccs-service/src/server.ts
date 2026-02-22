import path from "path";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.CCS_SERVICE_PORT || process.env.PORT || 3004;

// Supabase client (use service role key for server-side; create `messages` table in Supabase dashboard)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const logger = {
  info: (service: string, message: string, meta?: object) => {
    console.log(`[${service}] ${message}`, meta ?? "");
  },
  error: (service: string, message: string, err?: unknown) => {
    console.error(`[${service}] ${message}`, err ?? "");
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "ccs-service" });
});

// REST API for chat (optional; real-time is via Socket.IO)
app.get("/api/chat/status", (_req, res) => {
  res.json({ message: "Central Chat Server (CCS) is running" });
});

// Socket.IO handlers
io.on("connection", (socket) => {
  logger.info("CCS", "User connected", { socket_id: socket.id });

  socket.on("join:conversation", async (payload: { conversation_id: string; user_id: string }) => {
    const { conversation_id, user_id } = payload;
    try {
      socket.join(`conversation:${conversation_id}`);
      logger.info("CCS", "User joined conversation", { conversation_id, user_id });
      io.to(`conversation:${conversation_id}`).emit("user:joined", {
        user_id,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("CCS", "Failed to join conversation", error);
    }
  });

  socket.on(
    "message:send",
    async (payload: {
      conversation_id: string;
      sender_id: string;
      content: string;
      content_type?: string;
    }) => {
      const { conversation_id, sender_id, content, content_type = "text" } = payload;
      if (!supabase) {
        logger.error("CCS", "Supabase not configured (SUPABASE_URL and key required)");
        socket.emit("error", { message: "Chat storage not configured" });
        return;
      }
      try {
        const { data: row, error } = await supabase
          .from("messages")
          .insert({
            conversation_id,
            sender_id,
            content,
            content_type,
          })
          .select("id, conversation_id, sender_id, content, content_type, created_at")
          .single();
        if (error) {
          logger.error("CCS", "Failed to send message", error);
          socket.emit("error", { message: "Failed to send message" });
          return;
        }
        const message = {
          id: row.id,
          conversation_id: row.conversation_id,
          sender_id: row.sender_id,
          content: row.content,
          content_type: row.content_type,
          created_at: row.created_at,
        };
        io.to(`conversation:${conversation_id}`).emit("message:received", message);
        logger.info("CCS", "Message sent", { conversation_id, message_id: message.id });
      } catch (error) {
        logger.error("CCS", "Failed to send message", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  socket.on("typing:start", (payload: { conversation_id: string; user_id: string }) => {
    const { conversation_id, user_id } = payload;
    io.to(`conversation:${conversation_id}`).emit("typing:indicator", { user_id, typing: true });
  });

  socket.on("typing:stop", (payload: { conversation_id: string; user_id: string }) => {
    const { conversation_id, user_id } = payload;
    io.to(`conversation:${conversation_id}`).emit("typing:indicator", { user_id, typing: false });
  });

  socket.on("leave:conversation", (payload: { conversation_id: string; user_id: string }) => {
    const { conversation_id, user_id } = payload;
    socket.leave(`conversation:${conversation_id}`);
    io.to(`conversation:${conversation_id}`).emit("user:left", {
      user_id,
      timestamp: new Date(),
    });
    logger.info("CCS", "User left conversation", { conversation_id, user_id });
  });

  socket.on("disconnect", () => {
    logger.info("CCS", "User disconnected", { socket_id: socket.id });
  });
});

function start() {
  if (!supabase) {
    logger.info("CCS", "Supabase not configured; message persistence disabled. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).");
  }
  httpServer.listen(PORT, () => {
    logger.info("CCS", "Central Chat Server listening", { port: PORT });
  });
}

start();
