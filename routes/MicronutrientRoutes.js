import express from "express";
import { Micronutrient } from "../models/micronutrient.js";
import { getMicronutrientById } from "../controllers/products.js";

const router = express.Router();

router.get("/micronutrients", Micronutrient);

router.get("/micronutrients/:id", getMicronutrientById);

export default router;
