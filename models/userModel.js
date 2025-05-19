import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

export const createUser = async ({
  name,
  email,
  password,
  provider = "local",
}) => {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return existingUser;

    const id = uuidv4(); // Generate UUID

    await db.query(
      "INSERT INTO users (id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, password, provider]
    );

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!users || users.length === 0) {
      throw new Error("Failed to create user");
    }

    return users[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
