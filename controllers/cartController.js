import {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../models/cartModel.js";

export const addItemToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID, variant ID, and quantity are required",
      });
    }

    const result = await addToCart(userId, productId, variantId, quantity);
    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Error in addItemToCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await getCartItems(userId);

    res.status(200).json({
      success: true,
      user: req.user, // Send full user info
      cart: cartItems,
    });
  } catch (error) {
    console.error("Error in getUserCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    await updateCartItemQuantity(cartId, quantity);
    res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
    });
  } catch (error) {
    console.error("Error in updateItemQuantity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    await removeFromCart(cartId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error in removeItem:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const clearUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await clearCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearUserCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
