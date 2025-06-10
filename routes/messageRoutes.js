import express from "express";
import {
  sendMessage,
  getAdminMessages,
  getUnreadCount,
  markAsRead,
  getUserMessages,
} from "../controllers/messageController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin", authenticateToken, getAdminMessages);
router.post("/admin/send", authenticateToken, sendMessage);

// User routes
router.get("/", authenticateToken, getUserMessages);
router.post("/send", authenticateToken, sendMessage);
router.get("/unread", authenticateToken, getUnreadCount);
router.post("/read", authenticateToken, markAsRead);

export default router;
