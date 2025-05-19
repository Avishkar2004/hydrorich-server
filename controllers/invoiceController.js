import { generateInvoice } from "../utils/invoiceGenerator.js";
import { findUserByEmail } from "../models/userModel.js";
import { getUserOrders } from "../models/orderModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for generated invoices
const invoiceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const generateOrderInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId || isNaN(parseInt(orderId))) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized - Please login" });
    }

    const userId = req.session.user.id;

    // Check cache first
    const cacheKey = `${userId}-${orderId}`;
    const cachedInvoice = invoiceCache.get(cacheKey);
    if (
      cachedInvoice &&
      Date.now() - cachedInvoice.timestamp < CACHE_DURATION
    ) {
      return res.download(cachedInvoice.path, `invoice-${orderId}.pdf`);
    }

    // Get user details
    const user = await findUserByEmail(req.session.user.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get order details
    const orders = await getUserOrders(userId);
    const order = orders.find((o) => o.id === parseInt(orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Generate invoice
    const invoicePath = await generateInvoice(order, user);

    // Cache the invoice
    invoiceCache.set(cacheKey, {
      path: invoicePath,
      timestamp: Date.now(),
    });

    // Set appropriate headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.order_number}.pdf`
    );
    res.setHeader("Cache-Control", "private, max-age=300"); // Cache for 5 minutes

    // Send the file
    res.download(invoicePath, `invoice-${order.order_number}.pdf`, (err) => {
      if (err) {
        console.error("Error sending invoice:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error sending invoice" });
        }
      }

      // Delete the file after sending
      fs.unlink(invoicePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting invoice:", unlinkErr);
        }
      });
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating invoice",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};
