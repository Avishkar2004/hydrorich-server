import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { validateUserInput } from "../utils/validateUser.js";

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
