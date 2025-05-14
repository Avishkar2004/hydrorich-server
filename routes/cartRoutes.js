import express from "express";
import {
  addItemToCart,
  getUserCart,
  updateItemQuantity,
  removeItem,
  clearUserCart,
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Add item to cart
router.post("/add", addItemToCart);

// Get user's cart
router.get("/", getUserCart);

// Update item quantity
router.put("/item/:cartId", updateItemQuantity);

// Remove item from cart
router.delete("/item/:cartId", removeItem);

// Clear cart
router.delete("/clear", clearUserCart);

export default router;
