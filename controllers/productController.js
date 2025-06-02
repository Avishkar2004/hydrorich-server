import Product from "../models/Product.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, category, in_stock, variants } = req.body;

    // Validate required fields
    if (!name || !description || !category || !variants) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Handle photo uploads
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        photos.push(result.secure_url);
      }
    }

    // Create product data object
    const productData = {
      name,
      description,
      category,
      in_stock: in_stock === "true",
      variants: JSON.parse(variants),
      photos,
    };

    // Create product
    const result = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId: result.productId,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await Product.search(q);

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};
