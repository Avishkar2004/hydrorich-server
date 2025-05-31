import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/auth.js";
import { emitOrderStatusUpdate } from '../index.js';

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
router.put("/:orderId/status", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Emit order status update through Socket.io
        emitOrderStatusUpdate(orderId, status);

        res.json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Error updating order status" });
    }
});

export default router;
