import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in.",
    });
  }

  // Add user info to request object
  req.user = req.session.user;
  next();
};