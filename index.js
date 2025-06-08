import express from "express";
import "dotenv/config";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import compression from "compression";
import "./config/passport.js";
import {
  apiLimiter,
  authLimiter,
  invoiceLimiter,
  orderLimiter,
  searchLimiter,
  contactLimiter,
} from "./middleware/rateLimiter.js";
import pgrRouter from "./routes/pgrRoute.js";
import organicRouter from "./routes/organicRoutes.js";
import MicronutrientRoutes from "./routes/MicronutrientRoutes.js";
import InsecticideRoutes from "./routes/InsecticideRoutes.js";
import fungicideRouter from "./routes/fungicideRoute.js";
import authRouter from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import allProductsRouter from "./routes/allProductsRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cacheMiddleware from "./middleware/redisCache.js";
import productRoutes from "./routes/productRoutes.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join order tracking room
  socket.on("join_order_tracking", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(
      `User ${socket.id} joined order tracking room: order_${orderId}`
    );
  });

  // Leave order tracking room
  socket.on("leave_order_tracking", (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`User ${socket.id} left order tracking room: order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Function to emit order status updates
export const emitOrderStatusUpdate = (orderId, status) => {
  io.to(`order_${orderId}`).emit("order_status_update", {
    orderId,
    status,
    timestamp: new Date(),
  });
};

// Enable compression for all routes
app.use(compression({ threshold: 1024 })); // Only compress responses larger than 1KB

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      sameSite: "lax",
      httpOnly: true,
    },
  })
);

// Apply general rate limiter to all routes
app.use(apiLimiter);

// Apply specific rate limiter to routes
app.use("/api/auth", authLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api/invoices", invoiceLimiter);
app.use("/api/products/search", searchLimiter);

app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  (req, res) => {
    // Save user info to session
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
    };

    res.redirect(`${process.env.CLIENT_URL}`);
  }
);

app.get("/api/auth/user", (req, res) => {
  res.json(req.session.user || null);
});

app.get("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.redirect(process.env.CLIENT_URL);
  });
});

app.get("/", (req, res) => {
  res.send("Hello from Homepage");
});

app.use("/api", pgrRouter);
app.use("/api", organicRouter);
app.use("/api", MicronutrientRoutes);
app.use("/api", InsecticideRoutes);
app.use("/api", fungicideRouter);
app.use("/api/products", cacheMiddleware(3600), allProductsRouter);
app.use("/api/orders", orderRoutes);

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/get-products", productRoutes);
app.use("/api/contact", contactRoutes);

// ✅ Start server
server.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
