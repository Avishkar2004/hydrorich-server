import express from "express";
import { generateOrderInvoice } from "../controllers/invoiceController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Generate and download invoice for an order
router.get("/:orderId", authenticateToken, generateOrderInvoice);

export default router;
