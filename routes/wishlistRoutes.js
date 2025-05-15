import express from "express";

import {
  addToWishlist,
  checkWishlistItem,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticateToken);

// Add item to wishlist
router.post("/add", addToWishlist);

// Get user's wishlist
router.get("/", getWishlist);

// Check if the an item is in the wishlist
router.get("/check/:productId/:variantId", checkWishlistItem);

// Remove item from wishlist
router.delete("/item/:wishlistId", removeFromWishlist);

// Clear wishlist
router.delete("/clear", clearWishlist);

export default router;
