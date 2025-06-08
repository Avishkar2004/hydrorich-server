import express from "express";
import { plantgrowthregulator } from "../models/pgr.js";
import { getPgrById } from "../controllers/products.js";

const router = express.Router();

router.get("/pgrs", plantgrowthregulator);
router.get('/pgrs/:id', getPgrById);


export default router;
