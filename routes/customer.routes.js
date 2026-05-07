const express = require("express");
const router = express.Router();
const { createProfile, getProfile, updateProfile } = require("../controllers/customer.controller");
const { protect } = require("../middleware/auth");

router.post("/", protect, createProfile);
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);

module.exports = router;