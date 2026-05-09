const Order = require("../models/order.model");
const MenuItem = require("../models/menu.model");
const Review = require("../models/review.model");
const Vendor = require("../models/vendors.model");

// --- Get Vendor Orders ---
exports.getVendorOrders = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const orders = await Order.findAll({
      where: { vendor_id },
      order: [["placed_at", "DESC"]],
    });

    res.status(200).json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Update Order Status ---
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    await order.update({ status });

    res.status(200).json({ message: "Status updated", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Add Menu Item ---
exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price, image_url, vendor_id } = req.body;

    if (!name || !price || !vendor_id)
      return res.status(400).json({ message: "Name, price and vendor_id are required" });

    const item = await MenuItem.create({ name, description, price, image_url, vendor_id });

    res.status(201).json({ message: "Menu item added", item });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Edit Menu Item ---
exports.editMenuItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { name, description, price, image_url, is_available } = req.body;

    const item = await MenuItem.findByPk(item_id);
    if (!item)
      return res.status(404).json({ message: "Item not found" });

    await item.update({ name, description, price, image_url, is_available });

    res.status(200).json({ message: "Menu item updated", item });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Delete Menu Item ---
exports.deleteMenuItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    const item = await MenuItem.findByPk(item_id);
    if (!item)
      return res.status(404).json({ message: "Item not found" });

    await item.destroy();

    res.status(200).json({ message: "Menu item deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get Vendor Stats ---
exports.getVendorStats = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const totalOrders = await Order.count({ where: { vendor_id } });

    const deliveredOrders = await Order.findAll({ where: { vendor_id, status: "Delivered" } });
    const revenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const reviews = await Review.findAll({ where: { vendor_id } });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    res.status(200).json({ totalOrders, revenue: revenue.toFixed(2), avgRating });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};