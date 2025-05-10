import express from "express";
import {
  signup,
  loginUser,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginUser);
router.get("/user", getCurrentUser);

export default router;
