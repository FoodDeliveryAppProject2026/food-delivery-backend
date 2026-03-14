const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

// --- Create Token ---
const createToken = (user_id) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// --- Sign Up ---
exports.register = async (req, res) => {
  try {
    const { email, password, phone_number, role, order_delivery_id } = req.body;

    // required fields
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // password length
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    // password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password))
      return res.status(400).json({ message: "Password must contain at least one number, small and capital letter, special character" });

    // check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // check if phone number exists
    if (phone_number) {
      const existingPhone = await User.findOne({ where: { phone_number } });
      if (existingPhone)
        return res.status(400).json({ message: "Phone number already exists" });
    }

    // create user
    const user = await User.create({
      email,
      password_hash: password,
      phone_number,
      role,
      order_delivery_id: order_delivery_id || null,
    });

    const token = createToken(user.user_id);
    res.status(201).json({ message: "Registered successfully", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Sign In ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // required fields
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // find user
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = createToken(user.user_id);
    res.status(200).json({ message: "Login successful", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};