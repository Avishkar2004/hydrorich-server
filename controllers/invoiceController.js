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
      // Set headers before sending file
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${orderId}.pdf`
      );
      res.setHeader("Cache-Control", "private, max-age=300");

      // Stream the file instead of using res.download
      const fileStream = fs.createReadStream(cachedInvoice.path);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error("Error streaming cached invoice:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error streaming invoice" });
        }
      });

      return;
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
    res.setHeader("Cache-Control", "private, max-age=300");

    // Stream the file instead of using res.download
    const fileStream = fs.createReadStream(invoicePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("Error streaming invoice:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming invoice" });
      }
    });

    // Clean up the file after streaming
    fileStream.on("end", () => {
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
