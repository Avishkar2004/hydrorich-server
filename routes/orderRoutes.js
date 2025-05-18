import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new order
router.post("/", orderController.createOrder);

// Get a specific order
router.get("/:id", orderController.getOrder);

// Get all orders for the authenticated user
router.get("/", orderController.getUserOrders);

// Update order status
router.patch("/:orderId/status", orderController.updateOrderStatus);

export default router;
