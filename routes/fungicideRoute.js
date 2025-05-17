import express from "express";
import { Fungicide } from "../models/FungicideModel.js";
import { getFungicideById } from "../controllers/products.js";

const router = express.Router();

router.get("/fungicide", Fungicide);
router.get("/fungicide/:id", getFungicideById);

export default router;
