const express = require("express");
const router = express.Router();
const { getMyDelivery, getAllDeliveries, assignDriver, updateStatus, rateDriver } = require("../controllers/driver.controller");
const { protect } = require("../middleware/auth");

router.get("/my-delivery", protect, getMyDelivery);
router.get("/", protect, getAllDeliveries);
router.post("/assign", protect, assignDriver);
router.put("/status", protect, updateStatus);
router.put("/rate", protect, rateDriver);

module.exports = router;