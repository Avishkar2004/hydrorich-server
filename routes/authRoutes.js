import express from "express";
import {
  signup,
  loginUser,
  getCurrentUser,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginUser);
router.get("/user", getCurrentUser);
router.post("/user/change-password", changePassword);

export default router;
