// server.js or index.js
import express from "express";
import { db } from "./config/db.js"; // connection already tested here
import "dotenv/config";
import cors from "cors";
import pgrRouter from "./routes/pgrRoute.js";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Homepage");
});

app.use("/api", pgrRouter);

// ✅ Start server
app.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
