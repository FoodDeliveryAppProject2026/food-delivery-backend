const db = require('../config/db');

exports.getMeals = (req, res) => {

  const vendorId = req.params.id;

  const query = `
    SELECT *
    FROM menu_items
    WHERE vendor_id = ?

  `;
  db.query(query, [vendorId], (err, results) => {

    if(err){
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};