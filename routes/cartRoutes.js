import express from "express";

import {
  addItemToCart,
  clearUserCart,
  getUserCart,
  removeItem,
  updateItemQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

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
