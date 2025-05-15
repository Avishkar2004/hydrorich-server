import { db } from "../config/db.js";

export const addToCart = async (userId, productId, variantId, quantity) => {
  try {
    const [existing] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?",
      [userId, productId, variantId]
    );

    if (existing.length > 0) {
      // Update quantity if item already exists in cart
      const [result] = await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND variant_id = ?",
        [quantity, userId, productId, variantId]
      );
      return result;
    } else {
      // Insert new item into cart
      const [result] = await db.query(
        "INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)",
        [userId, productId, variantId, quantity]
      );
      return result;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCartItems = async (userId) => {
  try {
    const [items] = await db.query(
      `SELECT 
        c.id as cart_id,
        c.quantity,
        p.id as product_id,
        p.name as product_name,
        pv.id as variant_id,
        pv.variant_name,
        pv.price,
        pv.discount_percent,
        (
          SELECT image_url 
          FROM product_photos 
          WHERE product_id = p.id 
          LIMIT 1
        ) as image_url
      FROM cart c
      JOIN products p ON c.product_id = p.id
      JOIN product_variants pv ON c.variant_id = pv.id
      WHERE c.user_id = ?`,
      [userId]
    );
    return items;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartId, quantity) => {
  try {
    const [result] = await db.query(
      "UPDATE cart SET quantity = ? WHERE id = ?",
      [quantity, cartId]
    );
    return result;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
};

export const removeFromCart = async (cartId) => {
  try {
    const [result] = await db.query("DELETE FROM cart WHERE id = ?", [cartId]);
    return result;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const [result] = await db.query("DELETE FROM cart WHERE user_id = ?", [
      userId,
    ]);
    return result;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
