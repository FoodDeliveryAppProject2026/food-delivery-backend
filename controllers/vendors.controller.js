const { Op } = require("sequelize");
const Vendor = require("../models/vendors.model");

// --- Get All Approved Vendors ---
exports.getVendors = async (req, res) => {
  try {
    const { filter, search } = req.query;

    const where = { application_status: "Approved" };

    if (filter && filter !== "all") where.category_id = filter;

    if (search) where.store_name = { [Op.like]: `%${search}%` };

    const vendors = await Vendor.findAll({
      where,
      attributes: [
        "vendor_id",
        "store_name",
        "logo_url",
        "description",
        "is_open",
        "average_rating",
        "delivery_fee",
        "category_id",
      ],
      order: [["average_rating", "DESC"]],
    });

    res.status(200).json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
