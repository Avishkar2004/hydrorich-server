import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/adminAuth.js";
import { sendMessage, getMessages, getAdminMessages } from "../controllers/messageController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.post("/send", sendMessage);
router.get("/", getMessages);

// Admin routes
router.get("/admin", isAdmin, getAdminMessages);

export default router; 