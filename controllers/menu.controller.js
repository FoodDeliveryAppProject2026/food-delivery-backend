const MenuItem = require("../models/menu.model");

// --- Get All Menu Items for a Vendor ---
exports.getMeals = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await MenuItem.findAll({
      where: {
        vendor_id: id,
        is_available: true,
      },
    });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
