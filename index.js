import express from "express";
import "dotenv/config";
import cors from "cors";
import pgrRouter from "./routes/pgrRoute.js";
import passport from "passport";
import session from "express-session";
import "./config/passport.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
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
    res.redirect(`${process.env.CLIENT_URL}`);
  }
);

app.get("/api/auth/user", (req, res) => {
  res.send(req.user || null);
});

app.get("/api/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});
app.get("/", (req, res) => {
  res.send("Hello from Homepage");
});

app.use("/api", pgrRouter);

// ✅ Start server
app.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
