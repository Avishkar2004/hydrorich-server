import express from "express";
import { Micronutrient } from "../models/micronutrient.js";
import { getMicronutrientById } from "../controllers/products.js";

const router = express.Router();

router.get("/micronutrient", Micronutrient);

router.get("/micronutrient/:id", getMicronutrientById);

export default router;
