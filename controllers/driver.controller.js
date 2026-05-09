const Driver = require("../models/driver.model");
const Order = require("../models/order.model");

// --- Get My Delivery (Driver) ---
exports.getMyDelivery = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const delivery = await Driver.findOne({ where: { user_id } });
    if (!delivery)
      return res.status(404).json({ success: false, message: "No delivery found" });

    res.status(200).json({ success: true, data: delivery });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Get All Deliveries (Admin) ---
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Driver.findAll();
    res.status(200).json({ success: true, data: deliveries });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Assign Driver to Order ---
exports.assignDriver = async (req, res) => {
  try {
    const { order_id, user_id, first_name, last_name } = req.body;

    if (!order_id || !user_id)
      return res.status(400).json({ success: false, message: "order_id and user_id are required" });

    // check order exists
    const order = await Order.findByPk(order_id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // check if order already has a driver
    const existing = await Driver.findOne({ where: { order_id } });
    if (existing)
      return res.status(400).json({ success: false, message: "Order already has a driver assigned" });

    const delivery = await Driver.create({
      order_id,
      user_id,
      first_name,
      last_name,
      status: "Busy",
    });

    // update order status to Out for Delivery
    await order.update({ status: "Out for Delivery" });

    res.status(201).json({ success: true, message: "Driver assigned successfully", data: delivery });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Update Driver Status ---
exports.updateStatus = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { status } = req.body;

    const delivery = await Driver.findOne({ where: { user_id } });
    if (!delivery)
      return res.status(404).json({ success: false, message: "Delivery not found" });

    await delivery.update({ status });

    res.status(200).json({ success: true, message: "Status updated", data: delivery });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Rate Driver ---
exports.rateDriver = async (req, res) => {
  try {
    const { order_id, rating } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

    const delivery = await Driver.findOne({ where: { order_id } });
    if (!delivery)
      return res.status(404).json({ success: false, message: "Delivery not found" });

    await delivery.update({ rating });

    res.status(200).json({ success: true, message: "Driver rated successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};