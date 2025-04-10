import mysql from "mysql2";
import "dotenv/config";

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit:10 //! Bases on a traffic 
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to Database:", err);
    return;
  }
  console.log("✅ MySQL Connected!");
});
