import express from "express";
import "dotenv/config";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import "./config/passport.js";
import pgrRouter from "./routes/pgrRoute.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
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
    },
  })
);

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
      name:
        req.user.displayName ||
        `${req.user.name.givenName} ${req.user.name.familyName}`,
      email: req.user.email,
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

app.use("/api/auth", authRouter);

// ✅ Start server
app.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
