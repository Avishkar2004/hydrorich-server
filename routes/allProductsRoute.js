import express from "express";

import { getAllProducts } from "../models/allProductsModel.js";
import { getAllProductsById } from "../controllers/products.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getAllProductsById);

export default router;
