import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createMessage = async (senderId, receiverId, content) => {
  try {
    const id = uuidv4();
    const [result] = await db.query(
      "INSERT INTO messages (id, sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, NOW())",
      [id, senderId, receiverId, content]
    );
    return { id, senderId, receiverId, content, createdAt: new Date() };
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

export const getMessages = async (userId) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at ASC`,
      [userId, userId]
    );
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const getAdminMessages = async () => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, u.name as sender_name, u.email as sender_email
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       ORDER BY m.created_at ASC`
    );
    return messages;
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    throw error;
  }
}; 