const express = require("express");
const router = express.Router();
const { getVendorOrders, updateOrderStatus, addMenuItem, editMenuItem, deleteMenuItem, getVendorStats } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth");

router.get("/:vendor_id/orders", protect, getVendorOrders);
router.put("/orders/:order_id/status", protect, updateOrderStatus);
router.post("/menu", protect, addMenuItem);
router.put("/menu/:item_id", protect, editMenuItem);
router.delete("/menu/:item_id", protect, deleteMenuItem);
router.get("/:vendor_id/stats", protect, getVendorStats);

module.exports = router;