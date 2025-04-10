import express from "express";
import { db } from "./config/db.js";
import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Homepage");
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to Database: ", err);
    return; // Exit if connection fails
  }

  app.listen(process.env.PORT || 8080, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});
