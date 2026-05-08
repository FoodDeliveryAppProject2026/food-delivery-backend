const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({ message: "Not authorized. Please log in." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user)
      return res.status(401).json({ message: "User no longer exists." });

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(403).json({ message: "Token is invalid or expired. Please log in again." });
  }
};

module.exports = { protect };