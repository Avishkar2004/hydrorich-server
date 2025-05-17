import express from "express";
import { getInsecticides } from "../models/InsecticodeModel.js";
import { getInsecticideById } from "../controllers/products.js";

const router = express.Router();

router.get("/insecticides", getInsecticides);
router.get("/insecticides/:id", getInsecticideById);

export default router;
