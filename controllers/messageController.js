import {
  createMessage,
  getMessages as fetchMessages,
  getAdminMessages as fetchAdminMessages,
} from "../models/messageModel.js";
import { db } from "../config/db.js";

// Get admin user ID
const getAdminUserId = async () => {
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  return admins.length ? admins[0].id : null;
};

// Get messages for admin
export const getAdminMessages = async (req, res) => {
  try {
    const userId = req.query.userId;
    let query;
    let params = [];

    if (userId) {
      // Get messages for specific user
      query = `
        SELECT m.*, 
               s.name as sender_name, 
               r.name as receiver_name
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
           OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
      `;
      params = [userId, req.user.id, req.user.id, userId];
    } else {
      // Get all messages for admin
      query = `
        SELECT m.*, 
               s.name as sender_name, 
               r.name as receiver_name
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        WHERE m.receiver_id = ? OR m.sender_id = ?
        ORDER BY m.created_at DESC
      `;
      params = [req.user.id, req.user.id];
    }

    const [messages] = await db.query(query, params);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    let actualReceiverId = receiver_id;

    // If receiver_id is "admin", get the actual admin user ID
    if (receiver_id === "admin") {
      const adminId = await getAdminUserId();
      if (!adminId) {
        return res.status(500).json({
          success: false,
          message: "Admin user not found"
        });
      }
      actualReceiverId = adminId;
    }

    if (!actualReceiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required"
      });
    }

    // Insert message
    const [result] = await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [req.user.id, actualReceiverId, content]
    );

    // Get the inserted message with user details
    const [messages] = await db.query(
      `SELECT m.*, 
              s.name as sender_name, 
              r.name as receiver_name
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    const message = messages[0];

    // Emit the message through socket
    req.app.get("io").to(`chat_${[req.user.id, actualReceiverId].sort().join("_")}`).emit("new_message", message);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE",
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        count: result[0].count
      }
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count"
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { sender_id } = req.body;

    await db.query(
      "UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE",
      [sender_id, req.user.id]
    );

    res.json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read"
    });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is either sender or receiver
    const [messages] = await db.query(
      `SELECT m.*, 
        u1.name as sender_name,
        u2.name as receiver_name
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at ASC`,
      [userId, userId]
    );

    // Parse the messages to ensure they're in the correct format
    const parsedMessages = messages.map(message => ({
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      is_read: message.is_read,
      created_at: message.created_at,
      sender_name: message.sender_name,
      receiver_name: message.receiver_name
    }));

    res.json({
      success: true,
      data: parsedMessages
    });
  } catch (error) {
    console.error('Error getting user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};
