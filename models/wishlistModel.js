import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const addToWishlist = async (userId, productId, variantId) => {
  try {
    const id = uuidv4(); // Generate UUID
    const [existing] = await db.query(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ? AND variant_id = ?",
      [userId, productId, variantId]
    );

    if (existing.length > 0) {
      return { success: true, message: "Item already in wishlist" };
    } else {
      const [result] = await db.query(
        "INSERT INTO wishlist (user_id, product_id, variant_id) VALUES(?,?,?)",
        [userId, productId, variantId]
      );
      return { success: true, insertId: id }; // return id instead of result.insertId (since UUID is manual)
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

export const getWishlistItems = async (userId) => {
  try {
    const [items] = await db.query(
      `
            SELECT 
            w.id as wishlist_id,
            p.id as product_id,
            p.name as product_name,
            p.description,
            p.category,
            pv.id as variant_id,
            pv.variant_name,
            pv.price,
            pv.discount_percent,
            (
              SELECT image_url FROM product_photos WHERE product_id = p.id LIMIT 1            
            ) as image_url
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             JOIN product_variants pv ON w.variant_id = pv.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC
            `,
      [userId]
    );
    return items;
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    throw error;
  }
};

export const removeFromWishlist = async (wishlistId) => {
  try {
    const [result] = await db.query("DELETE FROM wishlist WHERE id = ?", [
      wishlistId,
    ]);
    return result;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

export const clearWishlist = async (userId) => {
  try {
    const [result] = await db.query("DELETE FROM wishlist WHERE user_id = ?", [
      userId,
    ]);
    return result;
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    throw error;
  }
};

export const isInWishlist = async (userId, productId, variantId) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ? AND variant_id = ?",
      [userId, productId, variantId]
    );
    return result.length > 0;
  } catch (error) {
    console.error("Error checking if item is in wishlist:", error);
    throw error;
  }
};
