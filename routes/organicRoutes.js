import express from "express";

import { OrganicFertilizer } from "../models/organicFertilizer.js";
import { getOrganicById } from "../controllers/products.js";

const router = express.Router();

router.get("/organic", OrganicFertilizer);
router.get("/organic/:id", getOrganicById);

export default router;
