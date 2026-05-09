const db = require("../config/db");

exports.getVendors = (req, res) => {
  const { filter, search } = req.query;

  let query = `
    SELECT 
      v.vendor_id,
      v.store_name,
      v.logo_url,
      v.description,
      v.is_open,
      v.average_rating,
      vc.name AS category_name
    FROM vendors v
    JOIN vendor_categories vc 
      ON v.category_id = vc.category_id
    WHERE v.application_status = 'Approved'
  `;
  const params = [];
  //execute if filter is not all and has a value
  if (filter && filter !== "all") {
    query += ` AND vc.name = ?`;
    params.push(filter);
  }

  if (search) {
    query += ` AND v.store_name LIKE ?`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY v.average_rating DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(results);
  });
};
