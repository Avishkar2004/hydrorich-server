import * as wishlistModel from "../models/wishlistModel.js";

export const addToWishlist = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.user.id;

    if (!userId || !productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const result = await wishlistModel.addToWishlist(
      userId,
      productId,
      variantId
    );

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      data: result,
    });
  } catch (error) {
    console.error("Error in addToWishlist controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await wishlistModel.getWishlistItems(userId);

    res.status(200).json({
      success: true,
      wishlist: items,
    });
  } catch (error) {
    console.error("Error in getWishlist controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;

    await wishlistModel.removeFromWishlist(wishlistId);

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error in removeFromWishlist controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
    });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    await wishlistModel.clearWishlist(userId);

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearWishlist controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};

export const checkWishlistItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const userId = req.user.id;

    const isInWishlist = await wishlistModel.isInWishlist(
      userId,
      productId,
      variantId
    );
    res.status(200).json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error("Error in checkWishlistItem controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status",
    });
  }
};
