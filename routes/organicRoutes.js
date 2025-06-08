import express from "express";

import { OrganicFertilizer } from "../models/organicFertilizer.js";
import { getOrganicById } from "../controllers/products.js";

const router = express.Router();

router.get("/organics", OrganicFertilizer);
router.get("/organics/:id", getOrganicById);

export default router;
