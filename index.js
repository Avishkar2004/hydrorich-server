import express from "express";
import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Homepage");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is up on ${process.env.PORT}`);
});
