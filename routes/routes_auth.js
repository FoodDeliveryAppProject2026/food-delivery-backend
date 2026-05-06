// FILE: routes/auth.js
const express = require("express");      
const router = express.Router();         

const {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/controllers_auth");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;