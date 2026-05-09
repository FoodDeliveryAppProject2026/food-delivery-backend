const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, getOrderDetails, updateOrderStatus, cancelOrder } = require("../controllers/order.controller");
const { protect } = require("../middleware/auth");

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:order_id", protect, getOrderDetails);
router.put("/:order_id/status", protect, updateOrderStatus);
router.put("/:order_id/cancel", protect, cancelOrder);

module.exports = router;