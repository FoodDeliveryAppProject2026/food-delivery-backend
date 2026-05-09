const OrderItem = require("../models/cart.model");
const MenuItem = require("../models/menu.model");

// --- Add Item to Cart ---
exports.addToCart = async (req, res) => {
  try {
    const { order_id, item_id, quantity } = req.body;

    if (!order_id || !item_id || !quantity)
      return res.status(400).json({
        success: false,
        message: "order_id, item_id and quantity are required",
      });

    const menuItem = await MenuItem.findByPk(item_id);
    if (!menuItem)
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });

    if (!menuItem.is_available)
      return res
        .status(400)
        .json({ success: false, message: "Menu item is not available" });

    const cartItem = await OrderItem.create({
      order_id,
      item_id,
      quantity,
      unit_price: menuItem.price,
    });

    res
      .status(201)
      .json({ success: true, message: "Item added to cart", data: cartItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Update Item Quantity ---
exports.updateQuantity = async (req, res) => {
  try {
    const { order_id, item_id, quantity } = req.body;

    if (!order_id || !item_id || !quantity)
      return res.status(400).json({
        success: false,
        message: "order_id, item_id and quantity are required",
      });

    if (quantity <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0" });

    const cartItem = await OrderItem.findOne({ where: { order_id, item_id } });
    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });

    await cartItem.update({ quantity });

    res
      .status(200)
      .json({ success: true, message: "Quantity updated", data: cartItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Remove Item from Cart ---
exports.removeItem = async (req, res) => {
  try {
    const { order_id, item_id } = req.params;

    const cartItem = await OrderItem.findOne({ where: { order_id, item_id } });
    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });

    await cartItem.destroy();

    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Get Cart Items ---
exports.getCart = async (req, res) => {
  try {
    const { order_id } = req.params;

    const items = await OrderItem.findAll({
      where: { order_id },
      include: [
        {
          model: MenuItem,
          attributes: ["name", "description", "image_url"],
        },
      ],
    });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Get Cart Summary ---
exports.getCartSummary = async (req, res) => {
  try {
    const { order_id } = req.params;

    const items = await OrderItem.findAll({ where: { order_id } });

    if (items.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Cart is empty or order not found" });

    const subtotal = items.reduce(
      (sum, i) => sum + i.quantity * parseFloat(i.unit_price),
      0,
    );
    const deliveryFee = 20;
    const tax = subtotal * 0.1;
    const total = subtotal + deliveryFee + tax;

    res.status(200).json({
      success: true,
      data: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee,
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
