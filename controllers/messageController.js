import {
  createMessage,
  getMessages as fetchMessages,
  getAdminMessages as fetchAdminMessages,
} from "../models/messageModel.js";
import { db } from "../config/db.js";

// Function to get admin user ID
const getAdminUserId = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
      [process.env.ADMIN_EMAIL]
    );
    return rows[0]?.id;
  } catch (error) {
    console.error("Error getting admin user ID:", error);
    throw error;
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.session.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Handle admin messages
    if (receiverId === 'admin') {
      const adminId = await getAdminUserId();
      if (!adminId) {
        return res.status(500).json({
          success: false,
          message: "Admin user not found",
        });
      }

      const message = await createMessage(senderId, adminId, content);

      // Emit the message to admin room
      req.app.get("io").to('admin').emit("newMessage", {
        ...message,
        sender_name: req.session.user.name,
      });

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    const message = await createMessage(senderId, receiverId, content);

    // Emit the message to the specific room (receiver's room)
    req.app.get("io").to(receiverId).emit("newMessage", {
      ...message,
      sender_name: req.session.user.name,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const messages = await fetchMessages(userId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export const getAdminMessages = async (req, res) => {
  try {
    const messages = await fetchAdminMessages();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};
