const express = require("express");
const router = express.Router();
const { addReview, getVendorReviews, getMyReviews } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth");

router.post("/", protect, addReview);
router.get("/vendor/:vendor_id", getVendorReviews);
router.get("/my-reviews", protect, getMyReviews);

module.exports = router;