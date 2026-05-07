const Customer = require("../models/customer.model");

// --- Create Customer Profile ---
exports.createProfile = async (req, res) => {
  try {
    const { first_name, last_name, default_address, default_latitude, default_longitude } = req.body;
    const user_id = req.user.user_id;

    if (!first_name || !last_name)
      return res.status(400).json({ message: "First and last name are required" });

    const existingCustomer = await Customer.findOne({ where: { user_id } });
    if (existingCustomer)
      return res.status(400).json({ message: "Profile already exists" });

    const customer = await Customer.create({
      first_name,
      last_name,
      default_address,
      default_latitude,
      default_longitude,
      user_id,
    });

    res.status(201).json({ message: "Profile created successfully", customer });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get Customer Profile ---
exports.getProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res.status(404).json({ message: "Profile not found" });

    res.status(200).json(customer);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Update Customer Profile ---
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { first_name, last_name, default_address, default_latitude, default_longitude } = req.body;

    const customer = await Customer.findOne({ where: { user_id } });
    if (!customer)
      return res.status(404).json({ message: "Profile not found" });

    await customer.update({ first_name, last_name, default_address, default_latitude, default_longitude });

    res.status(200).json({ message: "Profile updated successfully", customer });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};