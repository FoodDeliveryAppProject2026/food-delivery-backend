const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendOTP } = require("../services/email.service");
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
    const { email, password, phone_number, role } = req.body; // removed order_delivery_id

    // required fields
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // password length
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    // password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password))
      return res.status(400).json({
        message:
          "Password must contain at least one number, small and capital letter, special character",
      });

    // validate role if provided
    const allowedRoles = ["Customer", "Vendor", "Admin"];
    if (role && !allowedRoles.includes(role))
      return res
        .status(400)
        .json({ message: "Invalid role. Must be Customer, Vendor, or Admin" });

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
      phone_number: phone_number || null,
      role: role || null, // no forced default, matches SQL
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp_code: otp, otp_expires_at });
    await sendOTP(email, otp);

    res.status(201).json({ message: "Registered successfully. Check your email for OTP." });
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
      return res
        .status(400)
        .json({ message: "Email and password are required" });

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

// --- Verify OTP ---
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp_code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > user.otp_expires_at)
      return res.status(400).json({ message: "OTP has expired" });

    await user.update({ is_verified: true, otp_code: null, otp_expires_at: null });

    const token = createToken(user.user_id);
    res.status(200).json({ message: "Email verified successfully", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Forgot Password ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp_code: otp, otp_expires_at });
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Reset Password ---
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp_code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > user.otp_expires_at)
      return res.status(400).json({ message: "OTP has expired" });

    await user.update({ password_hash: new_password, otp_code: null, otp_expires_at: null });

    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};