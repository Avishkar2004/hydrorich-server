import express from "express";
import { Fungicide } from "../models/FungicideModel.js";
import { getFungicideById } from "../controllers/products.js";

const router = express.Router();

router.get("/fungicides", Fungicide);
router.get("/fungicides/:id", getFungicideById);

export default router;
