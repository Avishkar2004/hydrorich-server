import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
        decoded.id,
      ]);

      if (!users.length) {
        return next(new Error("User not found"));
      }

      socket.user = users[0];
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // Join user's personal room
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);

    // If user is admin, join admin room
    if (socket.user.role === "admin") {
      socket.join("admin_room");
      socket.emit("admin_room_joined");
    }

    // Handle joining a specific chat room
    socket.on("join_chat", (otherUserId) => {
      const chatRoom = `chat_${[socket.user.id, otherUserId].sort().join("_")}`;
      socket.join(chatRoom);
      console.log(`User ${socket.user.id} joined chat room: ${chatRoom}`);
    });

    // Handle leaving a chat room
    socket.on("leave_chat", (otherUserId) => {
      const chatRoom = `chat_${[socket.user.id, otherUserId].sort().join("_")}`;
      socket.leave(chatRoom);
      console.log(`User ${socket.user.id} left chat room: ${chatRoom}`);
    });

    // Handle new messages
    socket.on("send_message", async (data) => {
      try {
        const { receiver_id, content } = data;

        // If receiver_id is "admin", get the actual admin user ID
        let actualReceiverId = receiver_id;
        if (receiver_id === "admin") {
          const [admins] = await db.query(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
          );
          if (!admins.length) {
            throw new Error("Admin user not found");
          }
          actualReceiverId = admins[0].id;
        }

        if (!actualReceiverId) {
          throw new Error("Receiver ID is required");
        }

        // Insert message into database
        const [result] = await db.query(
          "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
          [socket.user.id, actualReceiverId, content]
        );

        const message = {
          id: result.insertId,
          sender_id: socket.user.id,
          receiver_id: actualReceiverId,
          content,
          created_at: new Date(),
          sender_name: socket.user.name,
        };

        // Create chat room name (sorted to ensure consistency)
        const chatRoom = `chat_${[socket.user.id, actualReceiverId]
          .sort()
          .join("_")}`;

        // Emit to the chat room
        io.to(chatRoom).emit("new_message", message);

        // Also emit to user's personal room for notification
        io.to(`user_${actualReceiverId}`).emit("message_notification", message);

        // If sender is admin, notify admin room
        if (socket.user.role === "admin") {
          io.to("admin_room").emit("admin_message_sent", message);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { receiver_id } = data;
      const chatRoom = `chat_${[socket.user.id, receiver_id].sort().join("_")}`;
      socket.to(chatRoom).emit("user_typing", {
        user_id: socket.user.id,
        isTyping: true,
      });
    });

    // Handle stop typing
    socket.on("stop_typing", (data) => {
      const { receiver_id } = data;
      const chatRoom = `chat_${[socket.user.id, receiver_id].sort().join("_")}`;
      socket.to(chatRoom).emit("user_typing", {
        user_id: socket.user.id,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });

  return io;
};
