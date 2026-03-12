
// FILE: middleware/auth.js
const jwt = require("jsonwebtoken");

// put the path of Model.js file
const User = require("../models/user.model"); 

const protect = async (req, res, next) => {
  try {
    let token;

    // --- STEP 1: Look for the token in the Authorization header ---
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // --- STEP 2: Block if no token ---
    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    // --- STEP 3: Verify the token ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- STEP 4: Find the user in MySQL ---
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // --- STEP 5: Attach user to request ---
    req.user = user;

    // --- STEP 6: Move on to the actual route ---
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(403).json({ message: "Token is invalid or expired. Please log in again." });
  }
};

module.exports = { protect };