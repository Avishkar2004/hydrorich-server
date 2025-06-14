import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const findUserByEmail = async (email) => {
  try {
    // console.log("Finding user by email:", email);
    const [rows] = await db.query(
      "SELECT id, name, email, password, provider, role, created_at FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  } catch (error) {
    console.error("Error in findUserByEmail:", error);
    throw error;
  }
};

export const createUser = async ({
  name,
  email,
  password,
  provider = "local",
  role = "user", // Default role is user
}) => {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return existingUser;

    const id = uuidv4(); // Generate UUID

    await db.query(
      "INSERT INTO users (id, name, email, password, provider, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, email, password, provider, role]
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

// Add new function to get all users (admin only)
export const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at FROM users"
  );
  return rows;
};

// Add function to update user role
export const updateUserRole = async (userId, newRole) => {
  await db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, userId]);
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  return rows[0];
};

export const updateUserPassword = async (userId, hashedPassword) => {
  try {
    // First update th password
    const updateQuery = `
    UPDATE users
    SET password = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `;

    const updateResult = await db.query(updateQuery, [hashedPassword, userId]);

    // Then verify the update by selecting the user
    const selectQuery = `
    SELECT id
    FROM users
    WHERE id = ? AND password = ?
    `;

    const [rows] = await db.query(selectQuery, [userId, hashedPassword]);

    if (rows.length === 0) {
      throw new Error("User not found or password update failed");
    }
    return rows[0];
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
};
