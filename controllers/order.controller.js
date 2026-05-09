const Order = require("../models/order.model");
const Customer = require("../models/customer.model");

// --- Place Order ---
exports.placeOrder = async (req, res) => {
  try {
    const {
      total_amount,
      payment_method,
      delivery_address,
      delivery_lat,
      delivery_long,
      vendor_id,
    } = req.body;
    const user_id = req.user.user_id;

    if (!total_amount || !delivery_address || !vendor_id)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res.status(404).json({
        success: false,
        message: "Customer profile not found. Please create a profile first.",
      });

    const order = await Order.create({
      total_amount,
      payment_method: payment_method || "COD",
      delivery_address,
      delivery_lat,
      delivery_long,
      vendor_id,
      customer_id: customer.customer_id,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Get My Orders (Customer) ---
exports.getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer profile not found" });

    const orders = await Order.findAll({
      where: { customer_id: customer.customer_id },
      order: [["placed_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Get Order Details ---
exports.getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Update Order Status ---
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    await order.update({ status });

    res
      .status(200)
      .json({ success: true, message: "Order status updated", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Cancel Order ---
exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status !== "Pending")
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });

    await order.update({ status: "Cancelled" });

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
