const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res
        .status(401)
        .json({ message: "Not authorized. Please log in." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ["password_hash", "otp_code", "otp_expires_at"] }, // ✅ exclude more sensitive fields
    });

    if (!user)
      return res.status(401).json({ message: "User no longer exists." });

    // ✅ Block unverified users from accessing protected routes
    if (!user.is_verified)
      return res
        .status(403)
        .json({ message: "Please verify your email first." });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res
      .status(401)
      .json({ message: "Token is invalid or expired. Please log in again." }); // ✅ 401 not 403
  }
};

// ✅ Role-based access control — add this too
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission." });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
