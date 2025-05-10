import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { validateUserInput } from "../utils/validateUser.js";
//Create Your Account

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //! 1. Validate user input

    const errors = validateUserInput({ name, email, password });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    //! 2. Check if user already exists

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });
    }

    //! 3. Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    //! 4. Save user

    const userId = await createUser({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      userId,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await findUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(401).json({ message: "Not authenticated" });
  }
};
