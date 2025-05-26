import express from "express";
import { addProduct, getProduct } from "../controllers/productController.js";
import { isAdmin } from "../middleware/adminAuth.js";
import { upload } from "../middleware/multer.js";
import { getAllProducts } from "../models/allProductsModel.js";

const router = express.Router();

// Admin routes
router.post("/add", isAdmin, upload.array("photos", 5), addProduct);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProduct);

export default router;
