const Review = require("../models/review.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");

// --- Add Review ---
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, order_id, vendor_id } = req.body;
    const user_id = req.user.user_id;

    if (!rating || !order_id || !vendor_id)
      return res.status(400).json({ message: "Rating, order_id and vendor_id are required" });

    // get customer
    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res.status(404).json({ message: "Customer profile not found" });

    // check order exists and is delivered
    const order = await Order.findByPk(order_id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered")
      return res.status(400).json({ message: "You can only review delivered orders" });

    // check if already reviewed
    const existingReview = await Review.findOne({ where: { order_id } });
    if (existingReview)
      return res.status(400).json({ message: "You already reviewed this order" });

    const review = await Review.create({
      rating,
      comment,
      order_id,
      vendor_id,
      customer_id: customer.customer_id,
    });

    res.status(201).json({ message: "Review added successfully", review });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get Vendor Reviews ---
exports.getVendorReviews = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const reviews = await Review.findAll({
      where: { vendor_id },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(reviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get My Reviews ---
exports.getMyReviews = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res.status(404).json({ message: "Customer profile not found" });

    const reviews = await Review.findAll({
      where: { customer_id: customer.customer_id },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(reviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};