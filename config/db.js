import mysql from "mysql2/promise";
import "dotenv/config";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10, //! Bases on a traffic
});

try {
  await db.query("SELECT 1");
  console.log("✅ MySQL Connected!");
} catch (error) {
  console.error("❌ MySQL Connection Failed:", error);
  process.exit(1);
}
