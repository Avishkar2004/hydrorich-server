import express from "express";
import { plantgrowthregulator } from "../models/pgr.js";
import { getPgrById } from "../controllers/products.js";

const router = express.Router();

router.get("/pgr", plantgrowthregulator);
router.get('/pgr/:id', getPgrById);


export default router;
