import express from "express";
import { isAdmin } from "../middleware/adminAuth.js";
import { getAllUsers, updateUserRole } from "../models/userModel.js";
import { getDashboardStats } from "../models/statsModel.js";

const router = express.Router();

// Protect all admin routes
router.use(isAdmin);

router.get("/users", async (req, res) => {
  try {
    console.log("Admin accessing users list:", req.session.user.email);
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    console.log("Admin accessing dashboard stats:", req.session.user.email);
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
});

router.put("/users/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    console.log("Admin updating user role:", {
      admin: req.session.user.email,
      userId,
      newRole: role,
    });

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await updateUserRole(userId, role);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .json(500)
      .json({ message: "Error updating user role", error: error.message });
  }
});

export default router;
